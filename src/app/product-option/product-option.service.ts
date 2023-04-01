import { ClientSession, Model, Types } from 'mongoose'

import { Status } from '@/common/constants'
import { optionItemKeyUid } from '@/common/helpers/key.helper'
import {
	ProductOption,
	ProductOptionDocument,
} from '@/schemas/product-option.schema'
import { Product, ProductDocument } from '@/schemas/product.schema'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { CounterService } from '../counter/counter.service'
import { CreateProductOptionDTO } from './dto/create-product-option.dto'
import { NewProductOptionDTO } from './dto/new-product-option.dto'
import {
	ApplyingProductInfo,
	ProductOptionDetailDTO,
} from './dto/product-option-detail.dto'
import { ProductOptionListItemDTO } from './dto/product-option-list-item.dto'
import { UpdateProductOptionDTO } from './dto/update-product-option.dto'
import { ProductOptionItem } from '@/schemas/product-option-item.schema'

@Injectable()
export class ProductOptionService {
	constructor(
		@InjectModel(ProductOption.name)
		private readonly productOptionModel: Model<ProductOptionDocument>,
		@InjectModel(Product.name)
		private readonly productModel: Model<ProductDocument>,
		private readonly counterService: CounterService
	) {}

	async getList(): Promise<ProductOptionListItemDTO[]> {
		const productOptions = await this.productOptionModel
			.aggregate<ProductOptionListItemDTO>([])
			.project({
				id: '$_id',
				code: 1,
				name: 1,
				parent: 1,
				range: 1,
				items: 1,
				status: {
					$cond: {
						if: { $eq: ['$deleted', true] },
						then: Status.REMOVED,
						else: {
							$cond: {
								if: { $eq: ['$disabled', true] },
								then: Status.DISABLED,
								else: Status.ACTIVE,
							},
						},
					},
				},
			})
			.project({
				_id: 0,
			})
			.addFields({
				used: 0,
			})
			.exec()
		return productOptions
	}

	async create(
		data: CreateProductOptionDTO,
		session?: ClientSession
	): Promise<NewProductOptionDTO> {
		const counter = await this.counterService.next('product_options', session)

		const createData: Partial<
			Pick<ProductOption, 'code' | 'name' | 'parent' | 'range' | 'items'>
		> = {
			code: counter,
			range: data.range,
		}

		if (data.parent) {
			const [parentOption, countChildOption] = await Promise.all([
				this.productOptionModel
					.findById(data.parent)
					.orFail(new BadRequestException('The parent option is not exist'))
					.select('name range items')
					.lean()
					.exec(),
				this.productOptionModel.countDocuments({ parent: data.parent }).exec(),
			])
			createData.parent = parentOption._id
			createData.name = parentOption.name + ` #${countChildOption + 1}`
			const parentItemMap = new Map(
				parentOption.items.map(item => [item.key, item])
			)
			createData.items = data.childItems.map(item => {
				const parentOptionItem = parentItemMap.get(item.key)
				return {
					...parentOptionItem,
					key: optionItemKeyUid(),
					parentKey: parentOptionItem.key,
					...(isNaN(item.cost) ? {} : { cost: item.cost }),
				}
			})
		} else {
			createData.name = data.name
			createData.items = data.newItems.map(item => ({
				key: optionItemKeyUid(),
				...item,
				disabled: false,
			}))
		}

		const option = await this.productOptionModel.create(
			[createData],
			session ? { session } : {}
		)
		return option[0]
	}

	async isExist(...listIds: string[]): Promise<string[]> {
		const products = await this.productOptionModel
			.find({ _id: { $in: listIds } })
			.select('_id')
			.lean()
			.exec()
		return listIds.filter(
			id => !products.some(product => id === product._id.toString())
		)
	}

	async getDetail(id: string) {
		const optionDetail = await this.productOptionModel
			.aggregate<
				Omit<ProductOptionDetailDTO, 'applyingAmount' | 'boughtAmount'>
			>()
			.match({ _id: new Types.ObjectId(id) })
			.lookup({
				from: 'product_options',
				localField: 'parent',
				foreignField: '_id',
				pipeline: [
					{
						$project: {
							id: '$_id',
							name: 1,
							code: 1,
							disabled: 1,
							deleted: 1,
						},
					},
					{
						$project: {
							_id: 0,
						},
					},
				],
				as: 'parent',
			})
			.unwind({
				path: '$parent',
				preserveNullAndEmptyArrays: true,
			})
			.lookup({
				from: 'product_options',
				localField: '_id',
				foreignField: 'parent',
				pipeline: [
					{
						$project: {
							id: '$_id',
							name: 1,
							code: 1,
							disabled: 1,
						},
					},
					{
						$project: {
							_id: 0,
						},
					},
				],
				as: 'children',
			})
			.unwind({
				path: '$children',
				preserveNullAndEmptyArrays: true,
			})
			.group({
				_id: '$_id',
				code: { $first: '$code' },
				name: { $first: '$name' },
				range: { $first: '$range' },
				items: { $first: '$items' },
				deleted: { $first: '$deleted' },
				deletedAt: { $first: '$deletedAt' },
				disabled: { $first: '$disabled' },
				createdAt: { $first: '$createdAt' },
				updatedAt: { $first: '$updatedAt' },
				parent: { $first: '$parent' },
				children: { $push: '$children' },
			})
			.project({ _id: 0 })
			.exec()
		return optionDetail[0]
	}

	async getApplyingProduct(optionId: string) {
		const applyingProducts = await this.productModel
			.aggregate<ApplyingProductInfo>()
			.match({ options: new Types.ObjectId(optionId) })
			.project({
				id: '$_id',
				code: 1,
				name: 1,
				disabled: 1,
				deleted: 1,
			})
			.project({
				_id: 0,
			})
			.exec()
		return applyingProducts
	}

	async update(
		optionId: string,
		updateInfo: UpdateProductOptionDTO,
		session?: ClientSession
	) {
		const productOption = await this.productOptionModel
			.findById(optionId)
			.orFail(new BadRequestException('Not found product option'))
			.select('parent items')
			.populate<{ parent: Pick<ProductOption, 'items'> }>({
				path: 'parent',
				select: 'items',
			})
			.lean()
			.exec()

		let items: ProductOptionItem[]
		if (!updateInfo.isParentOption) {
			if (!productOption.parent) {
				throw new BadRequestException('Product option is not parent option')
			}

			const parentItemsMap = new Map(
				productOption.parent.items.map(item => [item.key, item])
			)

			items = updateInfo.childrenItems.reduce((preRes, curItem) => {
				let res = [...preRes]
				let item: ProductOptionItem
				let idx: number

				switch (curItem.action) {
					case 'delete':
						res = preRes.filter(item => item.parentKey !== curItem.parentKey)
						break
					case 'add':
						item = {
							name: parentItemsMap.get(curItem.parentKey).name,
							parentKey: curItem.parentKey,
							key: optionItemKeyUid(),
							cost: curItem.cost,
							disabled: curItem.disabled,
						}
						res.push(item)
						break
					case 'update':
						idx = res.findIndex(
							item => item.parentKey.toString() === curItem.parentKey.toString()
						)
						if (typeof curItem.cost === 'number') {
							res[idx].cost = curItem.cost
						}
						if (typeof curItem.disabled === 'boolean') {
							res[idx].disabled = curItem.disabled
						}
						break
				}
				return res
			}, productOption.items)
		} else {
			items = updateInfo.parentItems.reduce((preRes, curItem) => {
				let res = [...preRes]
				let item: ProductOptionItem
				let idx: number

				switch (curItem.action) {
					case 'delete':
						res = preRes.filter(item => item.key !== curItem.key)
						break
					case 'add':
						item = {
							key: optionItemKeyUid(),
							name: curItem.name,
							cost: curItem.cost,
							disabled: curItem.disabled,
						}
						res.push(item)
						break
					case 'update':
						idx = res.findIndex(
							item => item.key.toString() === curItem.key.toString()
						)
						if (typeof curItem.name === 'string') {
							res[idx].name = curItem.name
						}
						if (typeof curItem.cost === 'number') {
							res[idx].cost = curItem.cost
						}
						break
				}
				return res
			}, productOption.items)
		}

		const updateOptionResult = await this.productOptionModel.updateOne(
			{ _id: optionId },
			{
				...updateInfo,
				items,
			},
			{ session }
		)

		return updateOptionResult
	}
}

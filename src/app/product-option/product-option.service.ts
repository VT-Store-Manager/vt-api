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
import { CreateProductOptionDto } from './dto/create-product-option.dto'
import { NewProductOptionDto } from './dto/new-product-option.dto'
import {
	ApplyingProductInfo,
	ProductOptionDetailDto,
} from './dto/product-option-detail.dto'
import { ProductOptionListItemDto } from './dto/product-option-list-item.dto'

@Injectable()
export class ProductOptionService {
	constructor(
		@InjectModel(ProductOption.name)
		private readonly productOptionModel: Model<ProductOptionDocument>,
		@InjectModel(Product.name)
		private readonly productModel: Model<ProductDocument>,
		private readonly counterService: CounterService
	) {}

	async getList(): Promise<ProductOptionListItemDto[]> {
		const productOptions = await this.productOptionModel
			.aggregate<ProductOptionListItemDto>([])
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
		data: CreateProductOptionDto,
		session?: ClientSession
	): Promise<NewProductOptionDto> {
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
					key: parentOptionItem.key + '-' + optionItemKeyUid(),
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
				Omit<ProductOptionDetailDto, 'applyingAmount' | 'boughtAmount'>
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
}

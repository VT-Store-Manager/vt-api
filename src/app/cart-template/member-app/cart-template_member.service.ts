import { intersection } from 'lodash'
import { Model, Types } from 'mongoose'

import {
	CartTemplate,
	CartTemplateDocument,
} from '@/schemas/cart-template.schema'
import { ProductOption } from '@/schemas/product-option.schema'
import { Product, ProductDocument } from '@/schemas/product.schema'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { CreateCartTemplateDTO } from './dto/create-cart-template.dto'
import { CartTemplateItemDTO } from './dto/response.dto'

@Injectable()
export class CartTemplateMemberService {
	constructor(
		@InjectModel(CartTemplate.name)
		private readonly cartTemplateModel: Model<CartTemplateDocument>,
		@InjectModel(Product.name)
		private readonly productModel: Model<ProductDocument>
	) {}

	async create(memberId: string, data: CreateCartTemplateDTO) {
		await this.validateProducts(data.products)

		const index = data.index ?? (await this.getMaxIndex(memberId))

		const createdResult = await this.cartTemplateModel.create({
			member: new Types.ObjectId(memberId),
			name: data.name,
			index,
			products: data.products,
		})

		return createdResult
	}

	async getAll(memberId: string): Promise<CartTemplateItemDTO[]> {
		return await this.cartTemplateModel
			.aggregate<CartTemplateItemDTO>([
				{
					$match: {
						member: new Types.ObjectId(memberId),
					},
				},
				{
					$sort: {
						index: 1,
						createdAt: -1,
					},
				},
				{
					$project: {
						id: '$_id',
						_id: false,
						name: true,
						index: true,
						products: true,
					},
				},
			])
			.exec()
	}

	private async validateProducts(
		cartProducts: CreateCartTemplateDTO['products']
	) {
		const products = await this.productModel
			.aggregate<
				Pick<Product, '_id' | 'deleted'> & {
					options: Pick<ProductOption, '_id' | 'range' | 'items'>[]
				}
			>([
				{
					$match: {
						_id: {
							$in: cartProducts.map(product => new Types.ObjectId(product.id)),
						},
					},
				},
				{
					$lookup: {
						from: 'product_options',
						localField: 'options',
						foreignField: '_id',
						as: 'options',
					},
				},
				{
					$project: {
						_id: {
							$toString: '$_id',
						},
						options: {
							_id: true,
							range: true,
							items: {
								parentKey: true,
								key: true,
								cost: true,
							},
						},
						deleted: true,
					},
				},
			])
			.exec()
		const productMap = new Map(
			products.map(product => [product._id.toString(), product])
		)
		cartProducts.forEach(validateProduct => {
			const product = productMap.get(validateProduct.id)
			if (!product) {
				throw new BadRequestException(`Product ${validateProduct.id} not found`)
			}
			if (product.deleted) {
				throw new BadRequestException(
					`Product ${validateProduct.id} is deleted`
				)
			}
			product.options.forEach(option => {
				const selectedKeys = intersection(
					option.items.map(item => item.parentKey || item.key),
					validateProduct.options
				)
				if (selectedKeys.length < option.range[0]) {
					throw new BadRequestException(
						`Option ${option._id.toString()} must contain more than ${
							option.range[0]
						} item`
					)
				}
				if (selectedKeys.length > option.range[1]) {
					throw new BadRequestException(
						`Option ${option._id.toString()} must contain less than ${
							option.range[1]
						} item`
					)
				}
			})
		})
	}

	private async getMaxIndex(memberId: string) {
		const cartTemplates = await this.cartTemplateModel
			.aggregate<Pick<CartTemplate, 'index'>>([
				{
					$match: {
						member: new Types.ObjectId(memberId),
					},
				},
				{
					$project: {
						index: true,
					},
				},
				{
					$sort: {
						index: -1,
					},
				},
				{
					$limit: 1,
				},
			])
			.exec()
		if (!cartTemplates || cartTemplates.length === 0) return 0

		return cartTemplates[0].index + 1
	}
}

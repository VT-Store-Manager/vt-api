import { intersection } from 'lodash'
import { Model, Types } from 'mongoose'

import { MongoSessionService } from '@/providers/mongo/session.service'
import {
	CartTemplate,
	CartTemplateDocument,
} from '@/schemas/cart-template.schema'
import { ProductOption } from '@/schemas/product-option.schema'
import { Product, ProductDocument } from '@/schemas/product.schema'
import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { ArrangeCartTemplateDTO } from './dto/arrange-cart-template.dto'
import { CreateCartTemplateDTO } from './dto/create-cart-template.dto'
import { EditCartTemplateDTO } from './dto/edit-cart-template.dto'
import { CartTemplateItemDTO } from './dto/response.dto'

@Injectable()
export class CartTemplateMemberService {
	constructor(
		@InjectModel(CartTemplate.name)
		private readonly cartTemplateModel: Model<CartTemplateDocument>,
		@InjectModel(Product.name)
		private readonly productModel: Model<ProductDocument>,
		private readonly mongoSessionService: MongoSessionService
	) {}

	async count(memberId: string) {
		return await this.cartTemplateModel
			.countDocuments({ member: new Types.ObjectId(memberId) })
			.exec()
	}

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

	async edit(memberId: string, templateId: string, data: EditCartTemplateDTO) {
		if (data.products) {
			await this.validateProducts(data.products)
		}

		const updatedTemplate = await this.cartTemplateModel
			.findOneAndUpdate(
				{
					_id: new Types.ObjectId(templateId),
					member: new Types.ObjectId(memberId),
				},
				{
					...data,
				},
				{
					new: true,
				}
			)
			.orFail(new BadRequestException('Cart template not found'))
			.select({
				id: '$_id',
				_id: false,
				name: true,
				products: true,
			})
			.lean()
			.exec()

		return updatedTemplate
	}

	async arrange(memberId: string, body: ArrangeCartTemplateDTO) {
		const [existTemplate, count] = await Promise.all([
			this.cartTemplateModel
				.aggregate<Pick<CartTemplate, '_id'>>([
					{
						$match: {
							_id: { $in: body.newOrder.map(id => new Types.ObjectId(id)) },
						},
					},
					{
						$project: {
							_id: true,
						},
					},
				])
				.exec(),
			this.count(memberId),
		])

		if (existTemplate.length < count) {
			throw new BadRequestException('New order size is incorrect')
		}
		const listExistId = existTemplate.map(template => template._id.toString())
		body.newOrder = body.newOrder.filter(id => listExistId.includes(id))

		const { error } = await this.mongoSessionService.execTransaction(
			async session => {
				const results = await Promise.all(
					body.newOrder.map((id, index) => {
						return this.cartTemplateModel
							.updateOne(
								{ _id: new Types.ObjectId(id) },
								{ index },
								{ session }
							)
							.exec()
					})
				)
				const failedList: string[] = []
				results.forEach((result, index) => {
					if (result.matchedCount === 0) {
						failedList.push(body.newOrder[index])
					}
				})
				if (failedList.length) {
					throw new Error(
						`Updating index of template${
							failedList.length > 1 ? 's' : ''
						} ${failedList.join(', ')} went wrong in server`
					)
				}
			}
		)

		if (error) {
			throw new InternalServerErrorException(error.message)
		}
		return true
	}

	async delete(memberId: string, templateId: string) {
		const deleteResult = await this.cartTemplateModel
			.deleteOne({
				_id: new Types.ObjectId(templateId),
				member: new Types.ObjectId(memberId),
			})
			.orFail(new BadRequestException('Cart template not found'))
			.exec()
		return deleteResult.deletedCount === 1
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

import { ClientSession, Model } from 'mongoose'

import { CounterService, Status } from '@app/common'
import { Product, ProductDocument } from '@app/database'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { CreateProductDTO } from './dto/create-product.dto'
import { GetProductListQueryDTO } from './dto/get-product-list-query.dto'
import {
	ProductListItemDTO,
	ProductListPaginationDTO,
} from './dto/response.dto'

@Injectable()
export class ProductService {
	constructor(
		@InjectModel(Product.name)
		private readonly productModel: Model<ProductDocument>,
		private readonly counterService: CounterService
	) {}

	async create(
		createdData: CreateProductDTO,
		session?: ClientSession
	): Promise<Product> {
		const counter = await this.counterService.next('products', session)
		const product = await this.productModel.create(
			[{ code: counter, ...createdData }],
			session ? { session } : {}
		)
		return product[0]
	}

	async getList(
		query: GetProductListQueryDTO
	): Promise<ProductListPaginationDTO> {
		const [totalCount, products] = await Promise.all([
			this.productModel.count().exec(),
			this.productModel
				.aggregate<ProductListItemDTO>([
					{
						$skip: (query.page - 1) * query.limit,
					},
					{
						$limit: query.limit,
					},
					{
						$lookup: {
							from: 'product_categories',
							localField: 'category',
							foreignField: '_id',
							as: 'category',
							pipeline: [
								{
									$project: {
										id: '$_id',
										_id: false,
										name: true,
										code: true,
									},
								},
							],
						},
					},
					{
						$lookup: {
							from: 'product_options',
							localField: 'options',
							foreignField: '_id',
							as: 'options',
							pipeline: [
								{
									$project: {
										id: '$_id',
										_id: false,
										name: true,
										range: true,
										items: { $size: '$items' },
										disabled: true,
										deleted: true,
									},
								},
							],
						},
					},
					{
						$unwind: '$category',
					},
					{
						$project: {
							id: '$_id',
							_id: false,
							code: true,
							name: true,
							images: true,
							originalPrice: true,
							category: true,
							options: true,
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
							updatedAt: 1,
						},
					},
					{
						$addFields: {
							salesVolume: {
								month: 0,
							},
						},
					},
				])
				.exec(),
		])
		return {
			totalCount,
			items: products,
		}
	}

	async isExist(...listIds: string[]): Promise<string[]> {
		const products = await this.productModel
			.find({ _id: { $in: listIds } })
			.select('_id')
			.lean()
			.exec()
		return listIds.filter(
			id => !products.some(product => id === product._id.toString())
		)
	}
}

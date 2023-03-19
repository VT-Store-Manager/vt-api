import { ClientSession, Model } from 'mongoose'

import { Product, ProductDocument } from '@/schemas/product.schema'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { CreateProductDto } from './dto/create-product.dto'
import { CounterService } from '../counter/counter.service'
import { ResponseProductItemDto } from './dto/response-products.dto'
import { Status } from '@/common/constants'

@Injectable()
export class ProductService {
	constructor(
		@InjectModel(Product.name)
		private readonly productModel: Model<ProductDocument>,
		private readonly counterService: CounterService
	) {}

	async create(
		createdData: CreateProductDto,
		session?: ClientSession
	): Promise<Product> {
		const counter = await this.counterService.next('products', session)
		const product = await this.productModel.create(
			[{ code: counter, ...createdData }],
			session ? { session } : {}
		)
		return product[0]
	}
	async getAll(): Promise<ResponseProductItemDto[]> {
		const products = await this.productModel
			.aggregate<ResponseProductItemDto>()
			.lookup({
				from: 'product_categories',
				localField: 'category',
				foreignField: '_id',
				as: 'category',
			})
			.unwind('category')
			.project({
				id: '$_id',
				code: 1,
				name: 1,
				images: 1,
				originalPrice: 1,
				category: {
					id: '$category._id',
					name: '$category.name',
					code: '$category.code',
				},
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
			})
			.project({
				_id: 0,
			})
			.addFields({
				salesVolumn: {
					month: 0,
				},
			})
			.exec()
		return products
	}
}

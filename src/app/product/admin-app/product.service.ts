import { ClientSession, Model } from 'mongoose'

import { CounterService } from '@/app/counter/counter.service'
import { Status } from '@/common/constants'
import { Product, ProductDocument } from '@/schemas/product.schema'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { CreateProductDTO } from './dto/create-product.dto'
import { ResponseProductItemDTO } from './dto/response-products.dto'

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

	async getAll(): Promise<ResponseProductItemDTO[]> {
		const products = await this.productModel
			.aggregate<ResponseProductItemDTO>()
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

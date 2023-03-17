import { ClientSession, Model } from 'mongoose'

import { Product, ProductDocument } from '@/schemas/product.schema'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { CreateProductDto } from './dto/create-product.dto'
import { CounterService } from '../counter/counter.service'

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
}

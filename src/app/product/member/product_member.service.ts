import { Model } from 'mongoose'

import { Product, ProductDocument } from '@/schemas/product.schema'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { ShortProductItemDTO } from './dto/response-short-product-item.dto'

@Injectable()
export class ProductMemberService {
	constructor(
		@InjectModel(Product.name)
		private readonly productModel: Model<ProductDocument>
	) {}

	async getShortInfoAllProduct() {
		return await this.productModel
			.aggregate<ShortProductItemDTO>()
			.project({
				id: '$_id',
				name: 1,
				mainImage: { $first: '$images' },
				price: '$originalPrice',
			})
			.project({
				_id: 0,
			})
			.exec()
	}

	// async getFullInfoOfProduct() {

	// }
}

import { Model, Types } from 'mongoose'

import { s3KeyPattern } from '@/common/constants'
import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import {
	ProductCategory,
	ProductCategoryDocument,
} from '@schema/product-category.schema'
import { Product, ProductDocument } from '@schema/product.schema'
import { Store, StoreDocument } from '@schema/store.schema'

import { ProductCategoryDTO } from './dto/response.dto'

@Injectable()
export class ProductCategoryMemberService {
	private readonly imageUrl: string
	constructor(
		@InjectModel(ProductCategory.name)
		private readonly productCategoryModel: Model<ProductCategoryDocument>,
		@InjectModel(Product.name)
		private readonly productModel: Model<ProductDocument>,
		@InjectModel(Store.name)
		private readonly storeModel: Model<StoreDocument>,
		private readonly configService: ConfigService
	) {
		this.imageUrl = configService.get<string>('imageUrl')
	}

	async getCategoriesWithProducts(storeId?: string) {
		let unavailableGoods: Store['unavailableGoods'] = {
			category: [],
			product: [],
			option: [],
		}
		if (storeId) {
			const store = await this.storeModel
				.findById(storeId)
				.orFail(new BadRequestException('Store not found'))
				.select('unavailableGoods')
				.lean()
				.exec()
			unavailableGoods = store.unavailableGoods
		}
		const products = await this.productModel
			.aggregate<ProductCategoryDTO>()
			.match({
				category: { $nin: unavailableGoods.category },
				_id: {
					$nin: unavailableGoods.product.map(
						id => new Types.ObjectId(id.toString())
					),
				},
			})
			.group({
				_id: '$category',
				productIds: { $push: '$_id' },
			})
			.lookup({
				from: 'product_categories',
				localField: '_id',
				foreignField: '_id',
				as: 'category',
			})
			.unwind({
				path: '$category',
			})
			.sort({
				'category.createdAt': 1,
			})
			.project({
				id: '$_id',
				name: '$category.name',
				image: {
					$cond: [
						{
							$regexMatch: {
								input: '$category.image',
								regex: s3KeyPattern,
							},
						},
						{ $concat: [this.imageUrl, '$category.image'] },
						null,
					],
				},
				productIds: 1,
				_id: 0,
			})
			.exec()
		return products
	}
}

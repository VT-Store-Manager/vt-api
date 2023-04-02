import {
	ProductCategory,
	ProductCategoryDocument,
} from '@/schemas/product-category.schema'
import { Product, ProductDocument } from '@/schemas/product.schema'
import { Store, StoreDocument } from '@/schemas/store.schema'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { ProductCategoryDTO } from './dto/response.dto'

@Injectable()
export class ProductCategoryMemberService {
	constructor(
		@InjectModel(ProductCategory.name)
		private readonly productCategoryModel: Model<ProductCategoryDocument>,
		@InjectModel(Product.name)
		private readonly productModel: Model<ProductDocument>,
		@InjectModel(Store.name)
		private readonly storeModel: Model<StoreDocument>
	) {}

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
				productIDs: { $push: '$_id' },
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
			.project({
				id: '$_id',
				name: '$category.name',
				image: '$category.image',
				productIDs: 1,
				_id: 0,
			})
			.exec()
		return products
	}
}

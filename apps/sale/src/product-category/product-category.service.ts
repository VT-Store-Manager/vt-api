import { Model, Types } from 'mongoose'

import { FileService } from '@app/common'
import {
	Product,
	ProductCategory,
	ProductCategoryDocument,
	ProductDocument,
	Store,
	StoreDocument,
} from '@app/database'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { ProductCategoryItemDTO } from './dto/response.dto'

@Injectable()
export class ProductCategoryService {
	constructor(
		@InjectModel(ProductCategory.name)
		private readonly productCategoryModel: Model<ProductCategoryDocument>,
		@InjectModel(Product.name)
		private readonly productModel: Model<ProductDocument>,
		@InjectModel(Store.name)
		private readonly storeModel: Model<StoreDocument>,
		private readonly fileService: FileService
	) {}

	async getCategoriesWithProducts(storeId?: string) {
		const store = await this.storeModel
			.findById(storeId)
			.orFail(new BadRequestException('Store not found'))
			.select('unavailableGoods')
			.lean()
			.exec()
		const { category } = store.unavailableGoods

		const categories = await this.productCategoryModel
			.aggregate<ProductCategoryItemDTO>([
				{
					$match: {
						_id: { $nin: category.map(v => new Types.ObjectId(v.toString())) },
						deleted: false,
						disabled: false,
					},
				},
				{
					$project: {
						id: '$_id',
						_id: false,
						name: true,
						image: this.fileService.getImageUrlExpression('$image'),
					},
				},
			])
			.exec()
		return categories
	}
}

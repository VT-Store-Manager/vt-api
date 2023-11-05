import { Model, Types } from 'mongoose'

import { FileService } from '@app/common'
import { Product, ProductDocument, Store, StoreDocument } from '@app/database'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { ProductListItemDTO } from './dto/response.dto'

@Injectable()
export class ProductService {
	constructor(
		@InjectModel(Product.name)
		private readonly productModel: Model<ProductDocument>,
		@InjectModel(Store.name)
		private readonly storeModel: Model<StoreDocument>,
		private readonly fileService: FileService
	) {}

	async getProductByCategory(storeId: string, categoryId: string) {
		const store = await this.storeModel
			.findById(storeId)
			.orFail(new BadRequestException('Store not found'))
			.select('unavailableGoods')
			.lean()
			.exec()
		const { product } = store.unavailableGoods

		const allProducts = await this.productModel
			.aggregate<ProductListItemDTO>([
				{
					$match: {
						_id: { $nin: product.map(v => new Types.ObjectId(v.toString())) },
						...(categoryId === 'all'
							? {}
							: { category: new Types.ObjectId(categoryId) }),
					},
				},
				{
					$project: {
						id: '$_id',
						_id: false,
						name: true,
						cost: '$originalPrice',
						images: {
							$filter: {
								input: {
									$map: {
										input: '$images',
										as: 'image',
										in: this.fileService.getImageUrlExpression('$$image'),
									},
								},
								as: 'image',
								cond: {
									$ne: ['$$image', null],
								},
							},
						},
						optionIds: '$options',
						description: true,
					},
				},
				{
					$addFields: {
						image: { $first: '$images' },
					},
				},
			])
			.exec()
		return allProducts
	}
}

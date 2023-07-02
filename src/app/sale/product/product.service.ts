import { Product, ProductDocument } from '@/database/schemas/product.schema'
import { Store, StoreDocument } from '@/database/schemas/store.schema'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { ProductListItemDTO } from './dto/response.dto'
import { ConfigService } from '@nestjs/config'
import { s3KeyPattern } from '@/common/constants'

@Injectable()
export class ProductService {
	private readonly imageUrl: string
	constructor(
		@InjectModel(Product.name)
		private readonly productModel: Model<ProductDocument>,
		@InjectModel(Store.name)
		private readonly storeModel: Model<StoreDocument>,
		private readonly configService: ConfigService
	) {
		this.imageUrl = configService.get<string>('imageUrl')
	}

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
										in: {
											$cond: [
												{
													$regexMatch: {
														input: '$$image',
														regex: s3KeyPattern,
													},
												},
												{ $concat: [this.imageUrl, '$$image'] },
												null,
											],
										},
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

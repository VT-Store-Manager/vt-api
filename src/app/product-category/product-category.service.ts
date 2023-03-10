import { ClientSession, Model } from 'mongoose'

import {
	ProductCategory,
	ProductCategoryDocument,
} from '@/schemas/product-category.schema'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Status } from '@/common/constants'
import { CounterService } from '../counter/counter.service'

type CreateProductCategoryModel = Pick<ProductCategory, 'image' | 'name'>

@Injectable()
export class ProductCategoryService {
	constructor(
		@InjectModel(ProductCategory.name)
		private readonly productCategoryModel: Model<ProductCategoryDocument>,
		private readonly counterService: CounterService
	) {}

	async create(data: CreateProductCategoryModel, session?: ClientSession) {
		const counter = await this.counterService.next(
			'product_categories',
			session
		)

		const category = await this.productCategoryModel.create(
			[
				{
					code: counter,
					...data,
				},
			],
			session ? { session } : {}
		)
		return category
	}

	async list() {
		const data = await this.productCategoryModel
			.aggregate()
			.project({
				id: '$_id',
				_id: 0,
				name: 1,
				image: 1,
				code: 1,
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
				amountOfProduct: { $ifNull: ['$amountOfProduct', 0] },
				totalSold: { $ifNull: ['$totalSold', 0] },
				soldOfWeek: { $ifNull: ['$soldOfWeek', 0] },
				order: {
					$ifNull: ['$displayOrder', 1],
				},
			})
			.exec()
		return data
	}

	async delete(id: string) {
		const deletedStatus = await this.productCategoryModel.updateOne(
			{ _id: id, deleted: false },
			{
				deleted: true,
				deletedAt: new Date(),
			}
		)

		return deletedStatus.modifiedCount === 1
			? 'Delete successful'
			: 'Category is not found or is deleted'
	}
}

import { Model } from 'mongoose'

import { getImagePath } from '@/common/helpers/file.helper'
import {
	PromotionCategory,
	PromotionCategoryDocument,
} from '@/schemas/promotion-category.schema'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { PromotionCategoryItemDTO } from './dto/response.dto'

@Injectable()
export class PromotionCategoryMemberService {
	constructor(
		@InjectModel(PromotionCategory.name)
		private readonly promotionCategoryModel: Model<PromotionCategoryDocument>
	) {}

	async getAll() {
		const categories = await this.promotionCategoryModel
			.aggregate<PromotionCategoryItemDTO>([
				{
					$lookup: {
						from: 'promotions',
						localField: '_id',
						foreignField: 'category',
						as: 'promotions',
						pipeline: [
							{
								$project: {
									_id: true,
								},
							},
						],
					},
				},
				{
					$unwind: {
						path: '$promotions',
						preserveNullAndEmptyArrays: true,
					},
				},
				{
					$group: {
						_id: '$_id',
						id: { $first: '$_id' },
						name: {
							$first: '$name',
						},
						image: {
							$first: '$image',
						},
						promotionIds: {
							$push: '$promotions._id',
						},
					},
				},
				{
					$project: {
						_id: false,
					},
				},
				{
					$sort: {
						id: 1,
					},
				},
			])
			.exec()

		return categories.map(category => ({
			...category,
			image: getImagePath(category.image),
		}))
	}
}

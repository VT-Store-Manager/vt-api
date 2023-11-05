import { Model } from 'mongoose'

import { FileService } from '@app/common'
import { PromotionCategory, PromotionCategoryDocument } from '@app/database'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { PromotionCategoryItemDTO } from './dto/response.dto'

@Injectable()
export class PromotionCategoryService {
	constructor(
		@InjectModel(PromotionCategory.name)
		private readonly promotionCategoryModel: Model<PromotionCategoryDocument>,
		private readonly fileService: FileService
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
					$addFields: {
						image: this.fileService.getImageUrlExpression('$image'),
					},
				},
				{
					$sort: {
						id: 1,
					},
				},
			])
			.exec()

		return categories
	}
}

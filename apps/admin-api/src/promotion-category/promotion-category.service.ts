import { ClientSession, Model } from 'mongoose'

import { PromotionCategory, PromotionCategoryDocument } from '@app/database'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { CreatePromotionCategoryDTO } from './dto/create-promotion-category.dto'

@Injectable()
export class PromotionCategoryService {
	constructor(
		@InjectModel(PromotionCategory.name)
		private readonly promotionCategoryModel: Model<PromotionCategoryDocument>
	) {}

	async create(data: CreatePromotionCategoryDTO, session?: ClientSession) {
		const [category] = await this.promotionCategoryModel.create(
			[{ ...data }],
			session ? { session } : {}
		)

		return category
	}
}

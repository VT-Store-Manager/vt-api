import { Model } from 'mongoose'

import { Promotion, PromotionDocument } from '@/schemas/promotion.schema'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

@Injectable()
export class PromotionAdminService {
	constructor(
		@InjectModel(Promotion.name)
		private readonly promotionModel: Model<PromotionDocument>
	) {}
}

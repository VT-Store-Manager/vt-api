import { FileService } from '@app/common'
import {
	MongoSessionService,
	PromotionCategory,
	PromotionCategorySchema,
} from '@app/database'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { PromotionCategoryController } from './promotion-category.controller'
import { PromotionCategoryService } from './promotion-category.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: PromotionCategory.name, schema: PromotionCategorySchema },
		]),
	],
	controllers: [PromotionCategoryController],
	providers: [PromotionCategoryService, FileService, MongoSessionService],
})
export class PromotionCategoryModule {}

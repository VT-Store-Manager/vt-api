import { FileService } from '@/app/modules/file/file.service'
import { MongoSessionService } from '@/common/providers/mongo-session.service'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
	PromotionCategory,
	PromotionCategorySchema,
} from '@schema/promotion-category.schema'

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

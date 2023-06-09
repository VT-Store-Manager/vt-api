import { MongoSessionService } from '@/common/providers/mongo-session.service'
import {
	PromotionCategory,
	PromotionCategorySchema,
} from '@schema/promotion-category.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { PromotionCategoryController } from './promotion-category.controller'
import { PromotionCategoryService } from './promotion-category.service'
import { FileService } from '@/app/modules/file/file.service'

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

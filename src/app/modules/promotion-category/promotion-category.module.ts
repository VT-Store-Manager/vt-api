import { MongoSessionService } from '@/common/providers/mongo-session.service'
import {
	PromotionCategory,
	PromotionCategorySchema,
} from '@schema/promotion-category.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { FileService } from '../file/file.service'
import { PromotionCategoryAdminController } from './admin-app/promotion-category_admin.controller'
import { PromotionCategoryAdminService } from './admin-app/promotion-category_admin.service'
import { PromotionCategoryMemberController } from './member-app/promotion-category_member.controller'
import { PromotionCategoryMemberService } from './member-app/promotion-category_member.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: PromotionCategory.name, schema: PromotionCategorySchema },
		]),
	],
	controllers: [
		PromotionCategoryAdminController,
		PromotionCategoryMemberController,
	],
	providers: [
		PromotionCategoryAdminService,
		PromotionCategoryMemberService,
		FileService,
		MongoSessionService,
	],
})
export class PromotionCategoryModule {}

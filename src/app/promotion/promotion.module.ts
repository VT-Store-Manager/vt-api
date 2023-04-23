import { Promotion, PromotionSchema } from '@/schemas/promotion.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { PromotionAdminController } from './admin-app/promotion_admin.controller'
import { PromotionAdminService } from './admin-app/promotion_admin.service'
import { PromotionMemberController } from './member-app/promotion_member.controller'
import { PromotionMemberService } from './member-app/promotion_member.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Promotion.name, schema: PromotionSchema },
		]),
	],
	controllers: [PromotionAdminController, PromotionMemberController],
	providers: [PromotionAdminService, PromotionMemberService],
})
export class PromotionModule {}

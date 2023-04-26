import { MongoSessionService } from '@/providers/mongo/session.service'
import { MemberRank, MemberRankSchema } from '@/schemas/member-rank.schema'
import { Promotion, PromotionSchema } from '@/schemas/promotion.schema'
import { Voucher, VoucherSchema } from '@/schemas/voucher.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { FileService } from '../file/file.service'
import { PromotionAdminController } from './admin-app/promotion_admin.controller'
import { PromotionAdminService } from './admin-app/promotion_admin.service'
import { PromotionMemberController } from './member-app/promotion_member.controller'
import { PromotionMemberService } from './member-app/promotion_member.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Promotion.name, schema: PromotionSchema },
			{ name: Voucher.name, schema: VoucherSchema },
			{ name: MemberRank.name, schema: MemberRankSchema },
		]),
	],
	controllers: [PromotionAdminController, PromotionMemberController],
	providers: [
		PromotionAdminService,
		PromotionMemberService,
		FileService,
		MongoSessionService,
	],
})
export class PromotionModule {}

import { MongoSessionService } from '@/common/providers/mongo-session.service'
import {
	MemberPromotionHistory,
	MemberPromotionHistorySchema,
} from '@schema/member-promotion-history.schema'
import { MemberRank, MemberRankSchema } from '@schema/member-rank.schema'
import {
	MemberVoucher,
	MemberVoucherSchema,
} from '@schema/member-voucher.schema'
import { Promotion, PromotionSchema } from '@schema/promotion.schema'
import { Voucher, VoucherSchema } from '@schema/voucher.schema'
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
			{ name: MemberVoucher.name, schema: MemberVoucherSchema },
			{
				name: MemberPromotionHistory.name,
				schema: MemberPromotionHistorySchema,
			},
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

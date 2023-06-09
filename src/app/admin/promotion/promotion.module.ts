import { FileService } from '@/app/modules/file/file.service'
import { SettingModule } from '@/app/modules/setting/setting.module'
import { MongoSessionService } from '@/common/providers/mongo-session.service'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
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
import { Rank, RankSchema } from '@schema/rank.schema'
import { Voucher, VoucherSchema } from '@schema/voucher.schema'

import { PromotionController } from './promotion.controller'
import { PromotionService } from './promotion.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Promotion.name, schema: PromotionSchema },
			{ name: Voucher.name, schema: VoucherSchema },
			{ name: MemberRank.name, schema: MemberRankSchema },
			{ name: Rank.name, schema: RankSchema },
			{ name: MemberVoucher.name, schema: MemberVoucherSchema },
			{
				name: MemberPromotionHistory.name,
				schema: MemberPromotionHistorySchema,
			},
		]),
		SettingModule,
	],
	controllers: [PromotionController],
	providers: [PromotionService, FileService, MongoSessionService],
})
export class PromotionModule {}

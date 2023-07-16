import { FileService } from '@/app/modules/file/file.service'
import { SettingModule } from '@/app/modules/setting/setting.module'
import { MongoSessionService } from '@app/common'
import {
	MemberPromotionHistory,
	MemberPromotionHistorySchema,
	MemberRank,
	MemberRankSchema,
	MemberVoucher,
	MemberVoucherSchema,
	Promotion,
	PromotionSchema,
	Rank,
	RankSchema,
	Voucher,
	VoucherSchema,
} from '@app/database'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

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

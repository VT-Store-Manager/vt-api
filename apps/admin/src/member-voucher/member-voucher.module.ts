import { SettingModule } from '@app/common'
import {
	MemberData,
	MemberDataSchema,
	MemberRank,
	MemberRankSchema,
	MemberVoucher,
	MemberVoucherHistory,
	MemberVoucherHistorySchema,
	MemberVoucherSchema,
	Notification,
	NotificationSchema,
	Voucher,
	VoucherSchema,
} from '@app/database'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { MemberVoucherController } from './member-voucher.controller'
import { MemberVoucherService } from './member-voucher.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Voucher.name, schema: VoucherSchema },
			{ name: MemberVoucher.name, schema: MemberVoucherSchema },
			{ name: MemberRank.name, schema: MemberRankSchema },
			{ name: MemberVoucherHistory.name, schema: MemberVoucherHistorySchema },
			{ name: Notification.name, schema: NotificationSchema },
			{ name: MemberData.name, schema: MemberDataSchema },
		]),
		SettingModule,
	],
	controllers: [MemberVoucherController],
	providers: [MemberVoucherService],
})
export class MemberVoucherModule {}

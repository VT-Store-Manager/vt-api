import { MemberData, MemberDataSchema } from '@schema/member-data.schema'
import { MemberRank, MemberRankSchema } from '@schema/member-rank.schema'
import {
	MemberVoucherHistory,
	MemberVoucherHistorySchema,
} from '@schema/member-voucher-history.schema'
import {
	MemberVoucher,
	MemberVoucherSchema,
} from '@schema/member-voucher.schema'
import { Notification, NotificationSchema } from '@schema/notification.schema'
import { Voucher, VoucherSchema } from '@schema/voucher.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { SettingModule } from '@/app/modules/setting/setting.module'
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

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

import { SettingModule } from '../setting/setting.module'
import { MemberVoucherAdminController } from './admin-app/member-voucher_admin.controller'
import { MemberVoucherAdminService } from './admin-app/member-voucher_admin.service'
import { MemberVoucherMemberController } from './member-app/member-voucher_member.controller'
import { MemberVoucherMemberService } from './member-app/member-voucher_member.service'

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
	controllers: [MemberVoucherAdminController, MemberVoucherMemberController],
	providers: [MemberVoucherAdminService, MemberVoucherMemberService],
})
export class MemberVoucherModule {}

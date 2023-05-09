import { MongoSessionService } from '@/common/providers/mongo-session.service'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { MemberData, MemberDataSchema } from '@schema/member-data.schema'
import {
	MemberPromotionHistory,
	MemberPromotionHistorySchema,
} from '@schema/member-promotion-history.schema'
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
import { Order, OrderSchema } from '@schema/order.schema'
import { Rank, RankSchema } from '@schema/rank.schema'

import { SettingModule } from '../modules/setting/setting.module'
import { MemberPromotionHistoryStreamService } from './services/member-promotion-history-stream.service'
import { MemberRankStreamService } from './services/member-rank-stream.service'
import { MemberVoucherStreamService } from './services/member-voucher-stream.service'
import { OrderStreamService } from './services/order-stream.service'
import { StreamHelperService } from './services/stream-helper.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: MemberPromotionHistory.name,
				schema: MemberPromotionHistorySchema,
			},
			{
				name: Notification.name,
				schema: NotificationSchema,
			},
			{
				name: MemberData.name,
				schema: MemberDataSchema,
			},
			{
				name: MemberVoucher.name,
				schema: MemberVoucherSchema,
			},
			{
				name: MemberRank.name,
				schema: MemberRankSchema,
			},
			{
				name: MemberVoucherHistory.name,
				schema: MemberVoucherHistorySchema,
			},
			{
				name: Order.name,
				schema: OrderSchema,
			},
			{
				name: Rank.name,
				schema: RankSchema,
			},
		]),
		SettingModule,
	],
	providers: [
		MongoSessionService,
		StreamHelperService,
		MemberPromotionHistoryStreamService,
		MemberRankStreamService,
		MemberVoucherStreamService,
		OrderStreamService,
	],
})
export class TriggerModule {}

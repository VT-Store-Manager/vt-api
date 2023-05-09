import { MongoSessionService } from '@/common/providers/mongo-session.service'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
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
import { Order, OrderSchema } from '@schema/order.schema'
import { Promotion, PromotionSchema } from '@schema/promotion.schema'
import { Rank, RankSchema } from '@schema/rank.schema'

import { SettingModule } from '../modules/setting/setting.module'
import { MemberRankStreamService } from './services/member-rank-stream.service'
import { MemberVoucherStreamService } from './services/member-voucher-stream.service'
import { NotificationStreamService } from './services/notification-stream.service'
import { OrderStreamService } from './services/order-stream.service'
import { PromotionStreamService } from './services/promotion-stream.service'
import { StreamHelperService } from './services/stream-helper.service'

@Module({
	imports: [
		MongooseModule.forFeature([
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
			{
				name: Promotion.name,
				schema: PromotionSchema,
			},
		]),
		SettingModule,
	],
	providers: [
		MongoSessionService,
		StreamHelperService,
		MemberRankStreamService,
		MemberVoucherStreamService,
		NotificationStreamService,
		PromotionStreamService,
		OrderStreamService,
	],
})
export class TriggerModule {}

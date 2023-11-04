import { MemberServerSocketClientService, SettingModule } from '@app/common'
import {
	MemberData,
	MemberDataSchema,
	MemberRank,
	MemberRankSchema,
	MemberVoucher,
	MemberVoucherHistory,
	MemberVoucherHistorySchema,
	MemberVoucherSchema,
	MongoSessionService,
	Notification,
	NotificationSchema,
	Order,
	OrderSchema,
	Promotion,
	PromotionSchema,
	Rank,
	RankSchema,
} from '@app/database'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { MemberDataStreamService } from './services/member-data-stream.service'
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
		MemberDataStreamService,
		MemberRankStreamService,
		MemberVoucherStreamService,
		NotificationStreamService,
		PromotionStreamService,
		OrderStreamService,
		MemberServerSocketClientService,
	],
})
export class TriggerModule {}

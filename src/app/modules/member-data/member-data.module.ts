import {
	MemberPromotionHistory,
	MemberPromotionHistorySchema,
} from '@schema/member-promotion-history.schema'
import { Order, OrderSchema } from '@schema/order.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { MemberDataMemberController } from './member-app/member-data_member.controller'
import { MemberDataMemberService } from './member-app/member-data_member.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: MemberPromotionHistory.name,
				schema: MemberPromotionHistorySchema,
			},
			{
				name: Order.name,
				schema: OrderSchema,
			},
		]),
	],
	controllers: [MemberDataMemberController],
	providers: [MemberDataMemberService],
})
export class MemberDataModule {}

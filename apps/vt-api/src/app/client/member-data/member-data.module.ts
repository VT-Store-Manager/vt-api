import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
	MemberPromotionHistory,
	MemberPromotionHistorySchema,
} from '@schema/member-promotion-history.schema'
import { Order, OrderSchema } from '@schema/order.schema'

import { MemberDataController } from './member-data.controller'
import { MemberDataService } from './member-data.service'

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
	controllers: [MemberDataController],
	providers: [MemberDataService],
})
export class MemberDataModule {}

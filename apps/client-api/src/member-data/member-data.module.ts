import {
	MemberPromotionHistory,
	MemberPromotionHistorySchema,
	Order,
	OrderSchema,
} from '@app/database'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

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

import { Member, MemberSchema, Order, OrderSchema } from '@app/database'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { StatisticController } from './statistic.controller'
import { StatisticService } from './statistic.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Member.name, schema: MemberSchema },
			{
				name: Order.name,
				schema: OrderSchema,
			},
		]),
	],
	controllers: [StatisticController],
	providers: [StatisticService],
})
export class StatisticModule {}

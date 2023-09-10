import {
	Member,
	MemberSchema,
	Order,
	OrderSchema,
	ProductCategory,
	ProductCategorySchema,
	Rank,
	RankSchema,
} from '@app/database'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { StatisticController } from './statistic.controller'
import { StatisticService } from './statistic.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Member.name, schema: MemberSchema },
			{ name: Rank.name, schema: RankSchema },
			{ name: Order.name, schema: OrderSchema },
			{ name: ProductCategory.name, schema: ProductCategorySchema },
		]),
	],
	controllers: [StatisticController],
	providers: [StatisticService],
})
export class StatisticModule {}

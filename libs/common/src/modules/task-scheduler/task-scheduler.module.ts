import {
	Order,
	OrderCustomerSchema,
	OrderMemberSchema,
	OrderSchema,
} from '@app/database'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { OrderBuyer } from '../../constants'
import { OrderTaskService } from './services/order-task.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Order.name,
				schema: OrderSchema,
				discriminators: [
					{ name: OrderBuyer.CUSTOMER, schema: OrderCustomerSchema },
					{ name: OrderBuyer.MEMBER, schema: OrderMemberSchema },
				],
			},
		]),
	],
	providers: [OrderTaskService],
	exports: [OrderTaskService],
})
export class TaskSchedulerModule {}

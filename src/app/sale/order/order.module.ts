import { OrderBuyer } from '@/common/constants'
import { OrderCustomerSchema } from '@/database/schemas/order-customer.schema'
import { OrderMemberSchema } from '@/database/schemas/order-member.schema'
import { Order, OrderSchema } from '@/database/schemas/order.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { OrderStateController } from './order-state.controller'
import { OrderStateService } from './order-state.service'

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
	controllers: [OrderStateController],
	providers: [OrderStateService],
})
export class OrderModule {}

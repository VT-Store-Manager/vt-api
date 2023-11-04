import { OrderBuyer } from '@app/common'
import {
	Order,
	OrderCustomerSchema,
	OrderMemberSchema,
	OrderSchema,
} from '@app/database'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { ConnectionModule } from '../connection/connection.module'
import { OrderStreamService } from './services/order-stream.service'
import { StreamHelperService } from './services/stream-helper.service'

@Module({
	imports: [
		ConnectionModule,
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
	providers: [OrderStreamService, StreamHelperService],
})
export class WsStreamModule {}

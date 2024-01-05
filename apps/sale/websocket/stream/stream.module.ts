import {
	GoogleMapModule,
	MomoModule,
	OrderBuyer,
	SettingModule,
} from '@app/common'
import {
	Order,
	OrderCustomerSchema,
	OrderMemberSchema,
	OrderSchema,
	Shipper,
	ShipperSchema,
} from '@app/database'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { ConnectionModule } from '../connection/connection.module'
import { OrderStreamService } from './services/order-stream.service'

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
			{
				name: Shipper.name,
				schema: ShipperSchema,
			},
		]),
		GoogleMapModule,
		SettingModule,
		MomoModule,
	],
	providers: [OrderStreamService],
})
export class WsStreamModule {}

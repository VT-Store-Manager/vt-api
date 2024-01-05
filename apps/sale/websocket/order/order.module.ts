import {
	GoogleMapModule,
	SettingModule,
	TaskSchedulerModule,
} from '@app/common'
import { Module } from '@nestjs/common'
import { OrderModule } from '@sale/src/order/order.module'
import { ShipperModule } from '@sale/src/shipper/shipper.module'

import { ConnectionModule } from '../connection/connection.module'
import { OrderMemberGateway } from './gateways/order-member.gateway'
import { OrderShipperGateway } from './gateways/order-shipper.gateway'
import { WsOrderService } from './order.service'

@Module({
	imports: [
		ConnectionModule,
		OrderModule,
		ShipperModule,
		GoogleMapModule,
		SettingModule,
		TaskSchedulerModule,
	],
	providers: [WsOrderService, OrderMemberGateway, OrderShipperGateway],
})
export class WsOrderModule {}

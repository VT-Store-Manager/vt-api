import { Module } from '@nestjs/common'
import { OrderModule } from '@sale/src/order/order.module'
import { ShipperModule } from '@sale/src/shipper/shipper.module'

import { OrderMemberGateway } from './gateways/order-member.gateway'
import { OrderShipperGateway } from './gateways/order-shipper.gateway'
import { WsOrderService } from './order.service'

@Module({
	imports: [OrderModule, ShipperModule],
	providers: [WsOrderService, OrderMemberGateway, OrderShipperGateway],
})
export class WsOrderModule {}

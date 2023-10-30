import { Namespace, Server, Socket } from 'socket.io'

import { HttpServer } from '@app/authentication'
import {
	getStoreRoom,
	OrderState,
	ShippingMethod,
	WebsocketExceptionsFilter,
	WsNamespace,
} from '@app/common'
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common'
import {
	ConnectedSocket,
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets'
import { OrderService } from '@sale/src/order/services/order.service'

import { MemberNewOrderDTO } from './dto/member-new-order.dto'

@UseFilters(new WebsocketExceptionsFilter())
@UsePipes(new ValidationPipe())
@WebSocketGateway({ cors: '*', namespace: WsNamespace.MEMBER })
export class MemberOrderGateway {
	constructor(private readonly orderService: OrderService) {}

	@WebSocketServer()
	nsp: Namespace

	@HttpServer()
	@SubscribeMessage('member:new_order')
	async memberNewOrder(@MessageBody() body: MemberNewOrderDTO) {
		const orderDetail = await this.orderService.getOrderDetail(
			body.storeId,
			body.orderId
		)
		this.nsp.server
			.of(WsNamespace.STORE)
			.to(getStoreRoom(body.storeId))
			.emit('store:new_order', orderDetail)

		if (
			orderDetail.categoryId === ShippingMethod.DELIVERY &&
			orderDetail.status === OrderState.PROCESSING
		) {
			this.nsp.server
				.of(WsNamespace.SHIPPER)
				.emit('shipper:new_order', orderDetail)
		}
	}
}

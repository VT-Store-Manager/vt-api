import { Namespace } from 'socket.io'

import { HttpServer } from '@app/authentication'
import {
	getShipperRoom,
	getStoreRoom,
	OrderState,
	ShippingMethod,
	WebsocketExceptionsFilter,
	WsNamespace,
} from '@app/common'
import {
	MemberEventMap,
	MemberEventNames,
	ShipperEventMap,
	StoreEventMap,
} from '@app/types'
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common'
import {
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets'
import { OrderService } from '@sale/src/order/services/order.service'

import { OrderDataDTO } from '../dto/order-data.dto'
import { WsOrderService } from '../order.service'

@UseFilters(new WebsocketExceptionsFilter())
@UsePipes(new ValidationPipe())
@WebSocketGateway({ cors: '*', namespace: WsNamespace.MEMBER })
export class OrderMemberGateway {
	constructor(
		private readonly orderService: OrderService,
		private readonly wsMemberOrderService: WsOrderService
	) {}

	@WebSocketServer()
	nsp: Namespace<MemberEventMap>
	storeNsp: Namespace<StoreEventMap>
	shipperNsp: Namespace<ShipperEventMap>

	private getStoreNsp(): Namespace<StoreEventMap> {
		if (!this.storeNsp) {
			this.storeNsp = this.nsp.server.of(WsNamespace.STORE)
		}
		return this.storeNsp
	}

	private getShipperNsp(): Namespace<ShipperEventMap> {
		if (!this.shipperNsp) {
			this.shipperNsp = this.nsp.server.of(WsNamespace.SHIPPER)
		}
		return this.shipperNsp
	}

	@HttpServer()
	@SubscribeMessage<MemberEventNames>('member:new_order')
	async memberNewOrder(@MessageBody() body: OrderDataDTO) {
		const orderCommonData = await this.wsMemberOrderService.getOrderCommonData(
			body.orderId
		)
		const orderDetail = await this.orderService.getOrderDetail(
			orderCommonData.store.id,
			body.orderId
		)
		this.getStoreNsp()
			.to(getStoreRoom(orderCommonData.store.id))
			.emit('store:new_order', orderDetail)

		if (
			orderDetail.categoryId === ShippingMethod.DELIVERY &&
			orderDetail.statusId === OrderState.PROCESSING &&
			!orderCommonData.shipper
		) {
			const shippingData = await this.wsMemberOrderService.getShippingData(
				body.orderId
			)
			this.getShipperNsp().emit('shipper:new_order', shippingData)
		}
	}

	@HttpServer()
	@SubscribeMessage<MemberEventNames>('member:paid_order')
	async memberPaidOrder(@MessageBody() body: OrderDataDTO) {
		const [orderCommonData, orderStatus] = await Promise.all([
			this.wsMemberOrderService.getOrderCommonData(body.orderId),
			this.wsMemberOrderService.getOrderStatus(body.orderId),
		])

		this.getStoreNsp()
			.to(getStoreRoom(orderCommonData.store.id))
			.emit('store:order_status_change', orderStatus)

		if (
			orderCommonData.categoryId === ShippingMethod.DELIVERY &&
			orderStatus.statusId === OrderState.PROCESSING &&
			!orderCommonData.shipper
		) {
			const shippingData = await this.wsMemberOrderService.getShippingData(
				body.orderId
			)
			this.getShipperNsp().emit('shipper:new_order', shippingData)
		}
	}

	@HttpServer()
	@SubscribeMessage<MemberEventNames>('member:cancel_order')
	async memberCancelledOrder(@MessageBody() body: OrderDataDTO) {
		const orderCommonData = await this.wsMemberOrderService.getOrderCommonData(
			body.orderId
		)
		this.getStoreNsp()
			.to(getStoreRoom(orderCommonData.store.id))
			.emit('store:cancelled_order', body)
		if (orderCommonData.shipper) {
			this.getShipperNsp()
				.to(getShipperRoom(orderCommonData.shipper.id))
				.emit('shipper:cancelled_order', body)
		}
	}
}

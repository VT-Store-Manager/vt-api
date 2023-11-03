import { Namespace, Socket } from 'socket.io'

import {
	MemberEventMap,
	ShipperEventMap,
	ShipperEventNames,
	StoreEventMap,
} from '@/libs/types/src'
import { CurrentClient, WsAuth } from '@app/authentication'
import {
	OrderState,
	Role,
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
import { ShipperOrderService } from '@sale/src/shipper/services/order.service'

import { OrderDataDTO } from '../dto/order-data.dto'
import { WsOrderService } from '../order.service'

@UseFilters(new WebsocketExceptionsFilter())
@UsePipes(new ValidationPipe())
@WebSocketGateway({ cors: '*', namespace: WsNamespace.SHIPPER })
export class OrderShipperGateway {
	constructor(
		private readonly orderService: OrderService,
		private readonly shipperOrderService: ShipperOrderService,
		private readonly wsOrderService: WsOrderService
	) {}

	@WebSocketServer()
	nsp: Namespace<ShipperEventMap>
	storeNsp: Namespace<StoreEventMap>
	memberNsp: Namespace<MemberEventMap>

	private getStoreNsp(): Namespace<StoreEventMap> {
		if (!this.storeNsp) {
			this.storeNsp = this.nsp.server.of(WsNamespace.STORE)
		}
		return this.storeNsp
	}

	private getMemberNsp(): Namespace<MemberEventMap> {
		if (!this.memberNsp) {
			this.memberNsp = this.nsp.server.of(WsNamespace.MEMBER)
		}
		return this.memberNsp
	}

	@WsAuth(Role.SHIPPER)
	@SubscribeMessage<ShipperEventNames>('shipper:pick_order')
	async shipperPickOrder(
		@MessageBody() body: OrderDataDTO,
		@CurrentClient('sub') shipperId: string,
		@ConnectedSocket() client: Socket<ShipperEventMap>
	) {
		const [orderShippingData, shipperInfo] = await Promise.all([
			this.wsOrderService.getOrderShippingData(body.orderId),
			this.wsOrderService.getShipperOrderData(shipperId),
		])

		const isWaitingShipper =
			orderShippingData.categoryId === ShippingMethod.DELIVERY &&
			orderShippingData.statusId === OrderState.PROCESSING &&
			!orderShippingData.shipper

		if (!isWaitingShipper) {
			client.emit('shipper:pick_order_error', body)
			return
		}
		try {
			const isUpdated = await this.wsOrderService.updateShipperOrder(
				body.orderId,
				shipperInfo
			)
			if (isUpdated) {
				client.broadcast.emit('shipper:remove_picked_order', body)
				client.emit('shipper:pick_order_success', body)
			} else {
				client.emit('shipper:pick_order_error', body)
			}
		} catch {
			client.emit('shipper:pick_order_error', body)
		}
		this.getStoreNsp()
	}
}

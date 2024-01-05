import { Socket } from 'socket.io'

import { ShipperEventMap, ShipperEventNames } from '@/libs/types/src'
import { CurrentClient, WsAuth } from '@app/authentication'
import {
	getStoreRoom,
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
} from '@nestjs/websockets'
import { WsConnectionService } from '@/apps/sale/websocket/connection/connection.service'

import { OrderDataDTO } from '../dto/order-data.dto'
import { WsOrderService } from '../order.service'

@UseFilters(new WebsocketExceptionsFilter())
@UsePipes(new ValidationPipe())
@WebSocketGateway({ cors: '*', namespace: WsNamespace.SHIPPER })
export class OrderShipperGateway {
	constructor(
		private readonly wsOrderService: WsOrderService,
		private readonly connectionProvider: WsConnectionService
	) {}

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
			client.emit('shipper:pick_order_error', {
				orderId: body.orderId,
				message: 'Order is not queued for shipper',
			})
			return
		}
		try {
			const isUpdated = await this.wsOrderService.updateShipperOrder(
				body.orderId,
				shipperInfo
			)
			if (isUpdated) {
				client.emit('shipper:pick_order_success', body)
				client.broadcast.emit('shipper:remove_picked_order', body)
				// Emit event: having shipper for order
				this.connectionProvider
					.getStoreNsp()
					.to(getStoreRoom(orderShippingData.store.id))
					.emit('store:shipper_picked', {
						id: body.orderId,
						shipper: shipperInfo,
					})

				this.wsOrderService.updateShipperIncome(body)
			} else {
				client.emit('shipper:pick_order_error', {
					orderId: body.orderId,
					message: 'Order is picked by another shipper',
				})
			}
		} catch (error) {
			client.emit('shipper:pick_order_error', {
				orderId: body.orderId,
				message: error.message,
			})
		}
	}
}

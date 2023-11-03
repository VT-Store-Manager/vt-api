import { Model, Types } from 'mongoose'

import { Order, OrderDocument } from '@app/database'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { OrderService } from '@sale/src/order/services/order.service'
import { WsException } from '@nestjs/websockets'
import { OrderStatusChangedDTO } from './dto/order-status-changed.dto'
import { ShippingMethod } from '@app/common'
import { ShippingOrderDataDTO } from './dto/shipping-order-data.dto'

type OrderCommonData = {
	categoryId: ShippingMethod
	store: {
		id: string
		name: string
	}
	member?: {
		id: string
		name: string
	}
	shipper?: {
		id: string
		name: string
	}
}

@Injectable()
export class WsMemberOrderService {
	constructor(
		private readonly orderService: OrderService,
		@InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>
	) {}

	async getOrderCommonData(orderId: string): Promise<OrderCommonData> {
		const [order] = await this.orderModel
			.aggregate<OrderCommonData>([
				{ $match: new Types.ObjectId(orderId.toString()) },
				{
					$addFields: {
						member: {
							$ifNull: ['$member', null],
						},
						shipper: {
							$ifNull: ['$shipper', null],
						},
					},
				},
				{
					$project: {
						_id: false,
						categoryId: '$type',
						store: {
							id: {
								$toString: '$store.id',
							},
							name: '$store.name',
						},
						member: {
							$cond: [
								{
									$eq: ['$member', null],
								},
								null,
								{
									id: {
										$toString: '$member.id',
									},
									name: '$member.name',
								},
							],
						},
						shipper: {
							$cond: [
								{
									$eq: ['$shipper', null],
								},
								null,
								{
									id: {
										$toString: '$shipper.id',
									},
									name: '$shipper.name',
								},
							],
						},
					},
				},
			])
			.exec()

		if (!order) throw new WsException('Order not found')

		return order
	}

	async getOrderStatus(orderId: string): Promise<OrderStatusChangedDTO> {
		const [orderStatus] = await this.orderModel
			.aggregate<OrderStatusChangedDTO>([
				{ $match: new Types.ObjectId(orderId.toString()) },
				{
					$project: {
						id: { $toString: '$_id' },
						_id: false,
						statusId: '$state',
						timeLog: {
							$map: {
								input: '$timeLog',
								as: 'log',
								in: {
									time: { $toLong: '$$log.time' },
									title: '$$log.title',
									description: '$$log.title',
								},
							},
						},
					},
				},
			])
			.exec()

		if (!orderStatus) throw new WsException('Order not found')

		return orderStatus
	}

	async getShippingData(orderId): Promise<ShippingOrderDataDTO> {
		const [shippingOrderData] = await this.orderModel
			.aggregate<ShippingOrderDataDTO>([
				{ $match: new Types.ObjectId(orderId.toString()) },
				{
					$lookup: {
						from: 'stores',
						localField: 'store.id',
						foreignField: '_id',
						as: 'storeData',
						pipeline: [
							{
								$project: {
									phone: true,
								},
							},
						],
					},
				},
				{
					$unwind: {
						path: '$storeData',
						preserveNullAndEmptyArrays: true,
					},
				},
				{
					$project: {
						id: '$_id',
						_id: false,
						quantity: {
							$reduce: {
								input: '$items',
								initialValue: 0,
								in: {
									$add: ['$$value', '$$this.quantity'],
								},
							},
						},
						totalPrice: '$totalProductPrice',
						shippingFee: {
							$subtract: ['$deliveryPrice', '$deliveryDiscount'],
						},
						paymentType: '$payment',
						receiver: {
							name: true,
							phone: true,
							address: true,
							lat: {
								$ifNull: ['$receiver.lat', 0],
							},
							lng: {
								$ifNull: ['$receiver.lng', 0],
							},
						},
						store: {
							name: true,
							phone: {
								$ifNull: ['$store.phone', '$storeData.phone'],
							},
							address: true,
							lat: {
								$ifNull: ['$receiver.lat', 0],
							},
							lng: {
								$ifNull: ['$receiver.lng', 0],
							},
						},
						createdAt: { $toLong: '$createdAt' },
					},
				},
			])
			.exec()

		if (!shippingOrderData) throw new WsException('Order not found')

		return shippingOrderData
	}
}

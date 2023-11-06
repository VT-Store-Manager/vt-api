import { Model, Types } from 'mongoose'
import { SoftDeleteModel } from 'mongoose-delete'

import { OrderState, ShippingMethod, getDistance } from '@app/common'
import {
	Order,
	OrderDocument,
	OrderInfoShipper,
	OrderInfoStore,
	Shipper,
	ShipperDocument,
	TimeLog,
} from '@app/database'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { WsException } from '@nestjs/websockets'
import { OrderService } from '@sale/src/order/services/order.service'
import { OrderShortDTO } from '@sale/src/shipper/dto/response.dto'
import { ShipperOrderService } from '@sale/src/shipper/services/order.service'

import { OrderStatusUpdatedDTO } from './dto/order-status-changed.dto'

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

type OrderShippingData = {
	categoryId: ShippingMethod
	statusId: OrderState
	store: OrderInfoStore
	shipper?: OrderInfoShipper
}

@Injectable()
export class WsOrderService {
	constructor(
		private readonly orderService: OrderService,
		private readonly shipperOrderService: ShipperOrderService,
		@InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
		@InjectModel(Shipper.name)
		private readonly shipperModel: SoftDeleteModel<ShipperDocument>
	) {}

	async getOrderCommonData(orderId: string): Promise<OrderCommonData> {
		const [order] = await this.orderModel
			.aggregate<OrderCommonData>([
				{ $match: { _id: new Types.ObjectId(orderId.toString()) } },
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

	async getOrderStatus(orderId: string): Promise<OrderStatusUpdatedDTO> {
		const [orderStatus] = await this.orderModel
			.aggregate<OrderStatusUpdatedDTO>([
				{ $match: { _id: new Types.ObjectId(orderId.toString()) } },
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

	async getShippingData(orderId): Promise<OrderShortDTO> {
		const [shippingOrderData] = await this.orderModel
			.aggregate<OrderShortDTO>([
				{ $match: { _id: new Types.ObjectId(orderId.toString()) } },
				...this.shipperOrderService.getOrderShortInfoPipeline(),
			])
			.exec()
		if (!shippingOrderData) throw new WsException('Order not found')

		shippingOrderData.shipDistance = getDistance(
			shippingOrderData.store,
			shippingOrderData.receiver
		)

		return shippingOrderData
	}

	async getShipperOrderData(shipperId: string): Promise<OrderInfoShipper> {
		const [shipperInfo] = await this.shipperModel
			.aggregate<OrderInfoShipper>([
				{
					$match: {
						_id: new Types.ObjectId(shipperId.toString()),
					},
				},
				{
					$project: {
						id: '$_id',
						_id: false,
						phone: true,
						name: true,
					},
				},
			])
			.exec()

		if (!shipperInfo) throw new WsException('Shipper not found')

		return shipperInfo
	}

	async getOrderShippingData(orderId: string): Promise<OrderShippingData> {
		const [orderShippingData] = await this.orderModel
			.aggregate<OrderShippingData>([
				{
					$match: {
						_id: new Types.ObjectId(orderId.toString()),
					},
				},
				{
					$project: {
						categoryId: '$type',
						statusId: '$state',
						store: true,
						shipper: { $ifNull: ['$shipper', null] },
					},
				},
			])
			.exec()

		if (!orderShippingData) throw new WsException('Order not found')

		return orderShippingData
	}

	async updateShipperOrder(orderId: string, shipperInfo: OrderInfoShipper) {
		const timeLog: TimeLog = {
			time: new Date(),
			title: 'Đã tìm thấy tài xế',
			description: `Đơn hàng được nhận bởi tài xế ${shipperInfo.name} - SĐT: ${shipperInfo.phone}`,
		}

		const updateResult = await this.orderModel
			.updateOne(
				{
					_id: new Types.ObjectId(orderId.toString()),
					$or: [
						{ shipper: { $exists: false } },
						{ shipper: { $in: [null, undefined] } },
					],
				},
				{
					$set: {
						shipper: shipperInfo,
					},
					$push: {
						timeLog,
					},
				}
			)
			.exec()

		if (updateResult.matchedCount === 0) {
			throw new Error('Order not found or had shipper')
		}

		return updateResult.modifiedCount > 0
	}
}

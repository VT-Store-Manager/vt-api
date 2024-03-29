import { isEqual } from 'lodash'
import { ChangeStreamDocument, ChangeStreamUpdateDocument } from 'mongodb'
import { Model, Types } from 'mongoose'

import {
	ChangeStreamLogger,
	FileService,
	getMemberRoom,
	getStoreRoom,
	GoogleMapService,
	MomoService,
	OrderBuyer,
	OrderState,
	PaymentType,
	SettingSaleService,
	ShippingMethod,
} from '@app/common'
import {
	Order,
	OrderInfoShipper,
	OrderMember,
	OrderMemberDocument,
	Shipper,
	ShipperDocument,
} from '@app/database'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { WsConnectionService } from '@/apps/sale/websocket/connection/connection.service'
import { OrderStatusUpdatedDTO } from '@websocket/order/dto/order-status-changed.dto'

@Injectable()
export class OrderStreamService implements OnModuleInit {
	constructor(
		@InjectModel(OrderBuyer.MEMBER)
		private readonly orderMemberModel: Model<OrderMemberDocument>,
		private readonly connectionProvider: WsConnectionService,
		@InjectModel(Shipper.name)
		private readonly shipperModel: Model<ShipperDocument>,
		private readonly googleMapService: GoogleMapService,
		private readonly settingSaleService: SettingSaleService,
		private readonly fileService: FileService,
		private readonly momoService: MomoService
	) {}

	onModuleInit() {
		const stream = this.orderMemberModel.watch(
			[
				{
					$match: {
						$and: [
							{ operationType: 'update' },
							{ 'fullDocument.member.id': { $ne: null } },
						],
					},
				},
				{
					$project: {
						ns: true,
						operationType: true,
						documentKey: true,
						updateDescription: true,
						fullDocument: {
							_id: true,
							store: true,
							member: true,
							shipper: true,
							state: true,
							timeLog: true,
							payment: true,
						},
						fullDocumentBeforeChange: {
							state: true,
							timeLog: true,
							shipper: true,
						},
					},
				},
			],
			{
				fullDocumentBeforeChange: 'whenAvailable',
				fullDocument: 'updateLookup',
			}
		)

		ChangeStreamLogger.debug('Order stream watching...')
		stream.on('change', (data: ChangeStreamDocument) => {
			const updateData = data as ChangeStreamUpdateDocument<OrderMemberDocument>

			if (!updateData.fullDocument) return

			this.updateOrderStatus(
				updateData.fullDocumentBeforeChange,
				updateData.fullDocument
			)
		})
	}

	private async updateOrderStatus(preData: OrderMember, postData: OrderMember) {
		const getOrderStatus = (
			data: OrderMember
		): Pick<OrderStatusUpdatedDTO, 'statusId' | 'timeLog'> &
			Pick<OrderInfoShipper, 'shippedEvidence'> => {
			return {
				statusId: data.state,
				timeLog: data.timeLog.map(log => {
					return {
						...log,
						time: log.time.getTime(),
					}
				}),
				shippedEvidence: data?.shipper?.shippedEvidence
					? this.fileService.getImageUrl(data.shipper.shippedEvidence)
					: null,
			}
		}

		const preOrderStatus = getOrderStatus(preData)
		const postOrderStatus = getOrderStatus(postData)

		if (isEqual(preOrderStatus, postOrderStatus)) return

		ChangeStreamLogger.verbose(
			`Order of ${postData.member.id.toString()} status updated: ${
				preOrderStatus.statusId
			} -> ${postOrderStatus.statusId} ; timeLog(${
				preOrderStatus.timeLog.length
			}) -> timeLog(${postOrderStatus.timeLog.length}) ; evidence(${
				preOrderStatus.shippedEvidence
			}) -> evidence(${postOrderStatus.shippedEvidence})`
		)
		this.connectionProvider
			.getMemberNsp()
			.to(getMemberRoom(postData.member.id))
			.emit('member-user:order_status_updated', {
				id: postData._id.toString(),
				...postOrderStatus,
			})
		this.connectionProvider
			.getStoreNsp()
			.to(getStoreRoom(postData.store.id))
			.emit('store:order_status_updated', {
				id: postData._id.toString(),
				...postOrderStatus,
			})

		const orderData = await this.orderMemberModel
			.findOne(
				{
					_id: postData._id,
				},
				{
					state: true,
					type: true,
					shipper: true,
					store: true,
					receiver: true,
				}
			)
			.lean()
			.exec()

		this.addToWalletShipper(orderData as Order)
		// Refund paid order
		if (
			preOrderStatus.statusId !== OrderState.CANCELED &&
			postOrderStatus.statusId === OrderState.CANCELED &&
			postData.payment === PaymentType.MOMO
		) {
			this.momoService.refundOrder(
				postData._id.toString(),
				postData.member.id.toString(),
				{
					lang: 'vi',
					description: 'Hoàn tiền đơn hàng bị huỷ',
				}
			)
		}
	}

	private async addToWalletShipper(order: Order) {
		if (!order) return
		if (
			order.state !== OrderState.DONE ||
			order.type !== ShippingMethod.DELIVERY
		) {
			return
		}
		if (!order.shipper?.id) return

		let shipperIncome = order.shipper?.shipperIncome
		if (!shipperIncome || shipperIncome > 60000) {
			const deliveryDistance =
				order.shipper?.deliveryDistance ??
				(await this.googleMapService.getShipDistance(
					{
						lat: order.store.lat,
						lng: order.store.lng,
					},
					{
						lat: order.receiver.lat,
						lng: order.receiver.lng,
					}
				))

			shipperIncome =
				this.settingSaleService.calculateShipperIncome(deliveryDistance)

			this.orderMemberModel
				.updateOne(
					{ _id: new Types.ObjectId(order._id) },
					{
						$set: {
							'shipper.shipperIncome': shipperIncome,
							'shipper.deliveryDistance': deliveryDistance,
						},
					}
				)
				.exec()
		}

		this.shipperModel
			.updateOne(
				{ _id: order.shipper.id },
				{
					$inc: { wallet: shipperIncome },
				}
			)
			.exec()
	}
}

import {
	Coordinate,
	OrderState,
	QueryTime,
	ShipperOrderState,
	ShippingMethod,
	getDistance,
} from '@app/common'
import {
	Order,
	OrderDocument,
	Shipper,
	ShipperDocument,
	TimeLog,
} from '@app/database'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { FilterQuery, Model, PipelineStage, Types } from 'mongoose'
import { GetOrderListDTO } from '../dto/get-order-list.dto'
import {
	CurrentOrderShortDTO,
	OrderDetailDTO,
	OrderListPaginationResultDTO,
	OrderShortDTO,
} from '../dto/response.dto'
import { SoftDeleteModel } from 'mongoose-delete'
import { GetPendingOrderListDTO } from '../dto/get-pending-order-list.dto'
import { sortBy } from 'lodash'

@Injectable()
export class ShipperOrderService {
	constructor(
		@InjectModel(Shipper.name)
		private readonly shipperModel: Model<ShipperDocument>,
		@InjectModel(Order.name)
		private readonly orderModel: SoftDeleteModel<OrderDocument>
	) {}

	getOrderShortInfoPipeline(): PipelineStage[] {
		return [
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
							$ifNull: ['$store.lat', 0],
						},
						lng: {
							$ifNull: ['$store.lng', 0],
						},
					},
					createdAt: { $toLong: '$createdAt' },
				},
			},
		]
	}

	getOrderDetailPipeline(): PipelineStage[] {
		return [
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
					code: true,
					items: {
						$map: {
							input: '$items',
							as: 'item',
							in: {
								id: '$$item.productId',
								name: '$$item.name',
								amount: '$$item.quantity',
								note: '$$item.note',
							},
						},
					},
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
							$ifNull: ['$store.lat', 0],
						},
						lng: {
							$ifNull: ['$store.lng', 0],
						},
					},
					timeLog: {
						$map: {
							input: '$timeLog',
							as: 'log',
							in: {
								time: {
									$toLong: '$$log.time',
								},
								title: '$$log.title',
								description: '$$log.description',
							},
						},
					},
					review: {
						$cond: [
							{
								$eq: [
									{
										$ifNull: ['$shipper.review', null],
									},
									null,
								],
							},
							null,
							{
								rate: '$shipper.review.rate',
								description: '$shipper.review.content',
							},
						],
					},
					createdAt: { $toLong: '$createdAt' },
				},
			},
		]
	}

	async updateOrderStatus(
		shipperId: string,
		orderId: string,
		state: ShipperOrderState
	) {
		const [shipper] = await Promise.all([
			this.shipperModel
				.findById(shipperId, {
					phone: true,
					name: true,
				})
				.orFail(new BadRequestException('Shipper not found'))
				.lean()
				.exec(),
			this.shipperModel
				.findOne(
					{
						_id: new Types.ObjectId(orderId),
						'shipper.id': new Types.ObjectId(shipperId),
					},
					{ _id: true }
				)
				.orFail(new BadRequestException('Shipper '))
				.exec(),
		])
		const timeLog: TimeLog =
			state === ShipperOrderState.TOOK_AWAY
				? {
						time: new Date(),
						title: 'Giao đơn hàng',
						description: `Đơn hàng được giao bởi ${shipper.name}.\nSĐT: ${shipper.phone}`,
				  }
				: {
						time: new Date(),
						title: 'Hoàn tất',
						description:
							'Bạn vừa nhận đơn hàng thành công. Cảm ơn đã chọn Chillin!',
				  }

		const updateResult = await this.orderModel
			.updateOne(
				{ _id: new Types.ObjectId(orderId) },
				{
					$push: {
						timeLog,
					},
					...(state === ShipperOrderState.DELIVERED
						? {
								$set: {
									state: OrderState.DONE,
								},
						  }
						: {}),
				}
			)
			.orFail(new BadRequestException('Order not found'))
			.exec()

		return updateResult.modifiedCount > 0
	}

	async getOrderListPagination(
		shipperId: string,
		query: GetOrderListDTO
	): Promise<OrderListPaginationResultDTO> {
		const time = (() => {
			const current = new Date()
			const today = new Date(
				current.getFullYear(),
				current.getMonth(),
				current.getDate()
			)
			if (query.time === QueryTime.TODAY) return today
			if (query.time === QueryTime.WEEK) {
				return new Date(today.setDate(today.getDate() - today.getDay()))
			}
			if (query.time === QueryTime.MONTH) {
				return new Date(today.setDate(1))
			}
			return new Date(0, 0, 0)
		})()
		const filter: FilterQuery<OrderDocument> = {
			'shipper.id': new Types.ObjectId(shipperId),
			createdAt: { $gte: time },
		}

		const [totalCountOrder, orders] = await Promise.all([
			this.orderModel.count(filter).exec(),
			this.orderModel
				.aggregate<OrderShortDTO>([
					{
						$match: filter,
					},
					...this.getOrderShortInfoPipeline(),
					{
						$sort: {
							createdAt: -1,
						},
					},
					{
						$skip: (query.page - 1) * query.limit,
					},
					{
						$limit: query.limit,
					},
				])
				.exec(),
		])

		orders.forEach(order => {
			order.shipDistance = getDistance(order.store, order.receiver)
		})

		const result: OrderListPaginationResultDTO = {
			maxCount: totalCountOrder,
			orders,
		}

		return result
	}

	async getPendingList(
		query: GetPendingOrderListDTO
	): Promise<CurrentOrderShortDTO[]> {
		const orders = await this.orderModel
			.aggregate<CurrentOrderShortDTO>([
				{
					$match: {
						type: ShippingMethod.DELIVERY,
						state: OrderState.PROCESSING,
					},
				},
				{
					$lookup: {
						from: 'shippers',
						localField: 'shipper.id',
						foreignField: '_id',
						as: 'shipperData',
						pipeline: [
							{
								$match: {
									deleted: false,
								},
							},
							{
								$project: {
									_id: true,
								},
							},
						],
					},
				},
				{
					$match: {
						$expr: {
							$gt: [
								{
									$size: '$shipperData',
								},
								0,
							],
						},
					},
				},
				...this.getOrderShortInfoPipeline(),
				{
					$addFields: {
						shipDistance: 0,
						pickDistance: null,
					},
				},
			])
			.exec()

		orders.forEach(order => {
			order.shipDistance = getDistance(order.store, order.receiver)
		})

		if (typeof query.lat === 'number' && typeof query.lng === 'number') {
			orders.forEach(order => {
				order.pickDistance = getDistance(order.store, query as Coordinate)
			})
		}

		const sortedOrders = sortBy(orders, ['pickDistance', 'createdAt'])

		return sortedOrders
	}

	async getOrderDetail(
		orderId: string,
		shipperId: string
	): Promise<OrderDetailDTO> {
		const [order] = await this.orderModel
			.aggregate<OrderDetailDTO>([
				{
					$match: {
						_id: new Types.ObjectId(orderId.toString()),
						'shipper.id': new Types.ObjectId(shipperId.toString()),
					},
				},
				...this.getOrderDetailPipeline(),
			])
			.exec()

		if (!order) throw new BadRequestException('Order not found')

		order.shipDistance = getDistance(order.store, order.receiver)

		return order
	}
}

import {
	Coordinate,
	FileService,
	GoogleMapService,
	OrderState,
	QueryTime,
	SettingSaleService,
	ShipperOrderState,
	ShippingMethod,
	getDistance,
} from '@app/common'
import {
	Order,
	OrderDocument,
	OrderInfoShipper,
	Shipper,
	ShipperDocument,
	TimeLog,
} from '@app/database'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import {
	ClientSession,
	FilterQuery,
	Model,
	PipelineStage,
	Types,
} from 'mongoose'
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
import moment from 'moment'
import { UploadEvidenceDTO } from '../dto/upload-evidence.dto'

@Injectable()
export class ShipperOrderService {
	constructor(
		@InjectModel(Shipper.name)
		private readonly shipperModel: Model<ShipperDocument>,
		@InjectModel(Order.name)
		private readonly orderModel: SoftDeleteModel<OrderDocument>,
		private readonly fileService: FileService,
		private readonly googleMapService: GoogleMapService,
		private readonly settingSaleService: SettingSaleService
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
					status: '$state',
					totalPrice: '$totalProductPrice',
					shippingFee: {
						$subtract: ['$deliveryPrice', '$deliveryDiscount'],
					},
					shipDistance: { $ifNull: ['$shipper.deliveryDistance', 0] },
					shipperIncome: { $ifNull: ['$shipper.shipperIncome', 0] },
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
					status: '$state',
					totalPrice: '$totalProductPrice',
					shippingFee: {
						$subtract: ['$deliveryPrice', '$deliveryDiscount'],
					},
					shipDistance: { $ifNull: ['$shipper.deliveryDistance', 0] },
					shipperIncome: { $ifNull: ['$shipper.shipperIncome', 0] },
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
					shippedEvidence: {
						$ifNull: [
							this.fileService.getImageUrlExpression(
								'$shipper.shippedEvidence'
							),
							null,
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
		const [shipper, order] = await Promise.all([
			this.shipperModel
				.findById(shipperId, {
					phone: true,
					name: true,
				})
				.orFail(new BadRequestException('Không tìm thấy tài xế'))
				.lean()
				.exec(),
			this.orderModel
				.findOne(
					{
						_id: new Types.ObjectId(orderId),
						'shipper.id': new Types.ObjectId(shipperId),
					},
					{ timeLog: true }
				)
				.orFail(new BadRequestException('Không tìm thấy đơn hàng'))
				.exec(),
		])

		const timeLog: TimeLog =
			state === ShipperOrderState.TOOK_AWAY
				? {
						time: new Date(),
						title: 'Giao đơn hàng',
						description: `Đơn hàng được giao bởi ${shipper.name}.\nSĐT: ${shipper.phone}`,
						state: OrderState.DELIVERING,
				  }
				: {
						// time: new Date(),
						// title: 'Hoàn tất',
						// description:
						// 	'Bạn vừa nhận đơn hàng thành công. Cảm ơn đã chọn Chillin!',
						// state: OrderState.DONE,
						time: new Date(),
						title: 'Nhận hàng thành công',
						description: `Bạn đã nhận hàng thành công từ tài xế ${shipper.name}`,
				  }

		const existedLog = order.timeLog.find(
			log => timeLog.state && log.state === timeLog.state
		)
		if (existedLog) {
			throw new BadRequestException(
				`Đơn hàng đã chuyển trạng thái '${existedLog.title}' lúc ${moment(
					existedLog.time
				).format('YYYY-MM-DD HH:mm:ss')}`
			)
		}

		const _updateResult = await this.orderModel
			.updateOne(
				{ _id: new Types.ObjectId(orderId) },
				{
					$push: {
						timeLog,
					},
					$set: {
						...(state === ShipperOrderState.TOOK_AWAY
							? { state: OrderState.DELIVERING }
							: {}),
					},
				}
			)
			.orFail(new BadRequestException('Không tìm thấy đơn hàng'))
			.exec()

		return true
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

		orders.forEach(async order => {
			if (!order.shipDistance || !order.shipperIncome) {
				const cal = await this.calculateShipperIncome({
					store: order.store,
					receiver: order.receiver,
				})
				order.shipDistance = cal.deliveryDistance
				order.shipperIncome = cal.shipperIncome
			}
		})

		const result: OrderListPaginationResultDTO = {
			maxCount: totalCountOrder,
			orders,
		}

		return result
	}

	async getDeliveringOrder(shipperId: string, query: GetPendingOrderListDTO) {
		const orders = await this.orderModel
			.aggregate<CurrentOrderShortDTO>([
				{
					$match: {
						type: ShippingMethod.DELIVERY,
						state: { $nin: [OrderState.DONE, OrderState.CANCELED] },
						'shipper.id': new Types.ObjectId(shipperId),
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

		orders.forEach(async order => {
			if (!order.shipDistance || !order.shipperIncome) {
				const cal = await this.calculateShipperIncome({
					store: order.store,
					receiver: order.receiver,
				})
				order.shipDistance = cal.deliveryDistance
				order.shipperIncome = cal.shipperIncome
			}
		})

		if (typeof query.lat === 'number' && typeof query.lng === 'number') {
			orders.forEach(order => {
				order.pickDistance = getDistance(order.store, query as Coordinate)
			})
		}

		const sortedOrders = sortBy(orders, ['pickDistance', 'createdAt'])

		return sortedOrders
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
							$eq: [
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

		orders.forEach(async order => {
			if (!order.shipDistance || !order.shipperIncome) {
				const cal = await this.calculateShipperIncome({
					store: order.store,
					receiver: order.receiver,
				})
				order.shipDistance = cal.deliveryDistance
				order.shipperIncome = cal.shipperIncome
			}
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

		if (!order) throw new BadRequestException('Không tìm thấy đơn hàng')

		if (!order.shipDistance || !order.shipperIncome) {
			const cal = await this.calculateShipperIncome({
				store: order.store,
				receiver: order.receiver,
			})
			order.shipDistance = cal.deliveryDistance
			order.shipperIncome = cal.shipperIncome
		}

		return order
	}

	async uploadEvidence(data: UploadEvidenceDTO, session?: ClientSession) {
		const order = await this.orderModel
			.findOne(
				{ _id: new Types.ObjectId(data.orderId) },
				{
					type: true,
					state: true,
					shipper: true,
				}
			)
			.orFail(new BadRequestException('Không tìm thấy đơn hàng'))
			.lean()
			.exec()

		if (order.type !== ShippingMethod.DELIVERY) {
			throw new BadRequestException(
				'Đơn hàng này không thuộc loại giao tận nơi'
			)
		}
		if (order.state !== OrderState.DELIVERING) {
			const message = OrderState.DONE
				? 'Đơn hàng đã hoàn tất'
				: 'Đơn hàng chưa được đổi trạng thái giao hàng'
			throw new BadRequestException(message)
		}
		if (!order.shipper) {
			throw new BadRequestException('Chưa có tài xế nhận đơn hàng này')
		}
		if (order.shipper.id.toString() !== data.shipperId) {
			throw new BadRequestException('Bạn không đảm nhận đơn hàng này')
		}

		const result = {
			success: false,
			oldEvidence: null,
		}

		if (order.shipper.shippedEvidence) {
			result.oldEvidence = order.shipper.shippedEvidence
		}

		const updateResult = await this.orderModel
			.updateOne(
				{ _id: new Types.ObjectId(data.orderId) },
				{
					$set: {
						'shipper.shippedEvidence': data.image,
					},
				},
				{ session }
			)
			.orFail(new BadRequestException('Không tìm thấy đơn hàng'))
			.exec()

		result.success = updateResult.modifiedCount > 0

		return result
	}

	async calculateShipperIncome(data: {
		store: Coordinate
		receiver: Coordinate
	}): Promise<Pick<OrderInfoShipper, 'deliveryDistance' | 'shipperIncome'>> {
		const deliveryDistance = await this.googleMapService.getShipDistance(
			{
				lat: data.store.lat,
				lng: data.store.lng,
			},
			{
				lat: data.receiver.lat,
				lng: data.receiver.lng,
			}
		)

		const shipperIncome =
			this.settingSaleService.calculateShipperIncome(deliveryDistance)

		return { deliveryDistance, shipperIncome }
	}
}

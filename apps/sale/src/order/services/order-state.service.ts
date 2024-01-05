import { uniq } from 'lodash'
import { FilterQuery, Model, Types } from 'mongoose'

import { FileService, OrderState, QueryTime } from '@app/common'
import { Order, OrderDocument } from '@app/database'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { GetOrderByStateDTO } from '../dto/get-order-by-state.dto'
import {
	OrderByStateResultDTO,
	OrderCartItemDTO,
	OrderStateItemDTO,
} from '../dto/response.dto'

@Injectable()
export class OrderStateService {
	constructor(
		@InjectModel(Order.name)
		private readonly orderModel: Model<OrderDocument>,
		private readonly fileService: FileService
	) {}

	getAllOrderStates(): OrderStateItemDTO[] {
		return [
			{
				id: OrderState.PENDING,
				name: 'Chờ thanh toán',
			},
			{
				id: OrderState.PROCESSING,
				name: 'Đang thực hiện',
			},
			{
				id: OrderState.DELIVERING,
				name: 'Đang giao hàng',
			},
			{
				id: OrderState.DONE,
				name: 'Đã hoàn tất',
			},
			{
				id: OrderState.CANCELED,
				name: 'Đã hủy',
			},
		]
	}

	async getOrderByState(
		storeId: string,
		state: OrderState | 'all',
		query: GetOrderByStateDTO
	): Promise<OrderByStateResultDTO> {
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
		const queryCondition: FilterQuery<OrderDocument> = {
			'store.id': new Types.ObjectId(storeId),
			...(state !== 'all' ? { state } : {}),
			createdAt: { $gte: time },
		}

		const [count, orders] = await Promise.all([
			this.orderModel.countDocuments(queryCondition).exec(),
			this.orderModel
				.aggregate<OrderCartItemDTO>([
					{
						$match: queryCondition,
					},
					{
						$project: {
							id: '$_id',
							_id: false,
							name: '',
							categoryId: '$type',
							cost: {
								$sum: [
									'$totalProductPrice',
									{
										$subtract: ['$deliveryPrice', '$deliveryDiscount'],
									},
								],
							},
							fee: {
								$subtract: ['$deliveryPrice', '$deliveryDiscount'],
							},
							time: { $toLong: '$createdAt' },
							rate: '$review.rate',
							payType: '$payment',
							given: {
								$cond: [{ $eq: ['$type', 0] }, '$totalProductPrice', null],
							},
							phone: '$member.phone',
							voucherName: '$voucher.title',
							username: '$member.name',
							products: {
								$map: {
									input: '$items',
									as: 'item',
									in: {
										id: '$$item.productId',
										name: '$$item.name',
										cost: {
											$subtract: ['$$item.unitPrice', '$$item.unitSalePrice'],
										},
										amount: '$$item.quantity',
										note: '$$item.note',
										options: '$$item.options',
									},
								},
							},
							shippedEvidence: {
								$ifNull: [
									this.fileService.getImageUrlExpression(
										'$shipper.shippedEvidence'
									),
									null,
								],
							},
						},
					},
					{
						$sort: {
							time: -1,
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

		return {
			maxCount: count,
			carts: orders.map(order => ({
				...order,
				name: (() => {
					const nameSet = uniq(order.products.map(v => v.name))
					if (nameSet.length < 3) {
						return nameSet.slice(0, 2).join(', ')
					} else {
						return `${nameSet.slice(0, 2).join(', ')} +${
							nameSet.length - 2
						} sản phẩm khác`
					}
				})(),
			})),
		}
	}
}

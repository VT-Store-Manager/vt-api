import { uniq } from 'lodash'
import { Model, Types } from 'mongoose'

import { OrderState } from '@/common/constants'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { GetOrderByStateDTO } from '../dto/get-order-by-state.dto'
import {
	OrderByStateResultDTO,
	OrderCartItemDTO,
	OrderStateItemDTO,
} from '../dto/response.dto'
import { Order, OrderDocument } from '@/database/schemas/order.schema'

@Injectable()
export class OrderStateService {
	constructor(
		@InjectModel(Order.name)
		private readonly orderModel: Model<OrderDocument>
	) {}

	getAllOrderStates(): OrderStateItemDTO[] {
		return [
			{
				id: OrderState.PROCESSING,
				name: 'Đang thực hiện',
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
		const [count, orders] = await Promise.all([
			this.orderModel
				.countDocuments({
					'store.id': new Types.ObjectId(storeId),
					...(state !== 'all' ? { state } : {}),
				})
				.exec(),
			this.orderModel
				.aggregate<OrderCartItemDTO>([
					{
						$match: {
							'store.id': new Types.ObjectId(storeId),
							...(state !== 'all' ? { state } : {}),
						},
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

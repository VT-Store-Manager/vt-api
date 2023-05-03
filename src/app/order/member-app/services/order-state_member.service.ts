import { uniq } from 'lodash'
import { Model, Types } from 'mongoose'

import { OrderBuyer, OrderState } from '@/common/constants'
import { OrderMemberDocument } from '@/schemas/order-member.schema'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { GetOrderByStateDTO } from '../dto/get-order-by-state.dto'
import { OrderByStateResultDTO, OrderCartItemDTO } from '../dto/response.dto'

@Injectable()
export class OrderStateMemberService {
	constructor(
		@InjectModel(OrderBuyer.MEMBER)
		private readonly orderMemberModel: Model<OrderMemberDocument>
	) {}

	async getOrderByState(
		memberId: string,
		state: OrderState,
		query: GetOrderByStateDTO
	): Promise<OrderByStateResultDTO> {
		const [count, orders] = await Promise.all([
			this.orderMemberModel
				.countDocuments({
					'member.id': new Types.ObjectId(memberId),
					state: state,
				})
				.exec(),
			this.orderMemberModel
				.aggregate<OrderCartItemDTO & { itemNames: string[] }>([
					{
						$match: {
							'member.id': new Types.ObjectId(memberId),
							state: state,
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
							time: '$createdAt',
							rate: '$review.rate',
							itemNames: {
								$map: {
									input: '$items',
									as: 'item',
									in: '$$item.name',
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
				id: order.id,
				name: (() => {
					const nameSet = uniq(order.itemNames)
					if (nameSet.length < 3) {
						return nameSet.slice(0, 2).join(', ')
					} else {
						return `${nameSet.slice(0, 2).join(', ')} +${
							nameSet.length - 2
						} sản phẩm khác`
					}
				})(),
				categoryId: order.categoryId,
				cost: order.cost,
				time: new Date(order.time).getTime(),
				rate: order.rate,
			})),
		}
	}
}

import uniq from 'lodash/uniq'
import { FilterQuery, Model, Types } from 'mongoose'

import { SortOrder } from '@app/common'
import { Order, OrderDocument } from '@app/database'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { GetOrderHistoryPaginationDTO } from './dto/get-order-history.dto'
import { GetOrderDetailDTO } from './dto/response.dto'

@Injectable()
export class OrderService {
	constructor(
		@InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>
	) {}

	async getHistoryPagination(query: GetOrderHistoryPaginationDTO) {
		const filter: FilterQuery<OrderDocument> = {
			...(query.store ? { 'store.id': new Types.ObjectId(query.store) } : {}),
			...(query.from
				? {
						createdAt: { $gte: new Date(query.from) },
				  }
				: {}),
			...(query.to
				? {
						createdAt: { $lt: new Date(query.to) },
				  }
				: {}),
		}

		const [totalCount, orders] = await Promise.all([
			this.orderModel.countDocuments(filter).exec(),
			this.orderModel
				.aggregate<GetOrderDetailDTO>([
					{
						$match: filter,
					},
					{
						$project: {
							id: '$_id',
							_id: false,
							code: true,
							name: '',
							categoryId: '$type',
							fee: {
								$subtract: ['$deliveryPrice', '$deliveryDiscount'],
							},
							originalFee: '$deliveryPrice',
							cost: {
								$sum: [
									'$totalProductPrice',
									{ $subtract: ['$deliveryPrice', '$deliveryDiscount'] },
								],
							},
							payType: '$payment',
							time: { $toLong: '$createdAt' },
							store: true,
							member: true,
							receiver: {
								phone: '$receiver.phone',
								name: '$receiver.name',
								address: '$receiver.address',
							},
							voucher: {
								id: '$voucher.id',
								discount: '$voucher.discountPrice',
								name: '$voucher.title',
							},
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
							'review.rate': '$review.rate',
							'review.review': '$review.content',
							point: '$point',
							status: '$state',
						},
					},
					{
						$sort: {
							time: query.order === SortOrder.DESC ? -1 : 1,
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
			order.name = (() => {
				const nameSet = uniq(order.products.map(v => v.name))
				if (nameSet.length < 3) {
					return nameSet.slice(0, 2).join(', ')
				} else {
					return `${nameSet.slice(0, 2).join(', ')} +${
						nameSet.length - 2
					} sản phẩm khác`
				}
			})()
		})

		return {
			totalCount,
			items: orders,
		}
	}
}

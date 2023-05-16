import { orderBy } from 'lodash'
import { Model, Types } from 'mongoose'

import { OrderState } from '@/common/constants'
import {
	MemberPromotionHistory,
	MemberPromotionHistoryDocument,
} from '@schema/member-promotion-history.schema'
import { Order, OrderDocument } from '@schema/order.schema'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { GetPointHistoryDTO } from './dto/get-point-history.dto'
import { HistoryItemDTO, PointHistoryResultDTO } from './dto/response.dto'

@Injectable()
export class MemberDataMemberService {
	constructor(
		@InjectModel(Order.name)
		private readonly orderModel: Model<OrderDocument>,
		@InjectModel(MemberPromotionHistory.name)
		private readonly memberPromotionHistoryModel: Model<MemberPromotionHistoryDocument>
	) {}

	async getPointHistory(
		memberId: string,
		query: GetPointHistoryDTO
	): Promise<PointHistoryResultDTO> {
		const [
			countDoneOrders,
			countPromotionHistory,
			doneOrders,
			promotionHistory,
		] = await Promise.all([
			this.orderModel
				.countDocuments({
					'member.id': new Types.ObjectId(memberId),
					state: OrderState.DONE,
				})
				.exec(),
			this.memberPromotionHistoryModel
				.countDocuments({
					member: new Types.ObjectId(memberId),
				})
				.exec(),
			this.orderModel
				.aggregate<HistoryItemDTO>([
					{
						$match: {
							'member.id': new Types.ObjectId(memberId),
							state: OrderState.DONE,
						},
					},
					{
						$project: {
							id: '$_id',
							_id: false,
							point: true,
							name: {
								$concat: ['Đơn hàng #', '$code'],
							},
							time: { $toLong: '$createdAt' },
						},
					},
					{
						$sort: {
							time: -1,
						},
					},
					{
						$limit: query.limit * query.page,
					},
					{
						$addFields: {
							targetId: 1,
						},
					},
				])
				.exec(),
			this.memberPromotionHistoryModel
				.aggregate<HistoryItemDTO>([
					{
						$match: {
							member: new Types.ObjectId(memberId),
						},
					},
					{
						$project: {
							id: '$_id',
							_id: false,
							point: { $multiply: [-1, '$promotionData.cost'] },
							name: '$promotionData.title',
							time: { $toLong: '$createdAt' },
						},
					},
					{
						$sort: {
							time: -1,
						},
					},
					{
						$limit: query.limit * query.page,
					},
					{
						$addFields: {
							targetId: 2,
						},
					},
				])
				.exec(),
		])

		const historyPoints: HistoryItemDTO[] = orderBy(
			[...doneOrders, ...promotionHistory],
			'time',
			'desc'
		).slice((query.page - 1) * query.limit, query.page * query.limit)

		return { maxCount: countDoneOrders + countPromotionHistory, historyPoints }
	}
}

import { Model, Types } from 'mongoose'

import { getImagePath } from '@/common/helpers/file.helper'
import { MemberRank, MemberRankDocument } from '@/schemas/member-rank.schema'
import { Promotion, PromotionDocument } from '@/schemas/promotion.schema'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { PromotionItemDTO } from './dto/response.dto'

@Injectable()
export class PromotionMemberService {
	constructor(
		@InjectModel(Promotion.name)
		private readonly promotionModel: Model<PromotionDocument>,
		@InjectModel(MemberRank.name)
		private readonly memberRankModel: Model<MemberRankDocument>
	) {}

	async getAll(memberId: string) {
		const memberRank = await this.memberRankModel
			.findOne({
				member: new Types.ObjectId(memberId),
			})
			.select('member rank -_id')
			.lean()
			.exec()

		const now = new Date()
		const promotions = await this.promotionModel
			.aggregate<PromotionItemDTO>([
				{
					$match: {
						startTime: {
							$lte: now,
						},
						$and: [
							{
								$or: [
									{
										finishTime: {
											$gt: now,
										},
									},
									{
										finishTime: null,
									},
								],
							},
							{
								$or: [
									{
										'possibleTarget.0': {
											$exists: false,
										},
									},
									{
										possibleTarget: memberRank.member,
									},
									{
										possibleTarget: memberRank.rank,
									},
								],
							},
						],
					},
				},
				{
					$lookup: {
						from: 'vouchers',
						localField: 'voucher',
						foreignField: '_id',
						as: 'voucher',
						pipeline: [
							{
								$match: {
									$and: [
										{
											$or: [
												{
													startTime: null,
												},
												{
													startTime: {
														$lte: now,
													},
												},
											],
										},
										{
											$or: [
												{
													finishTime: null,
												},
												{
													finishTime: {
														$gt: now,
													},
												},
											],
										},
									],
								},
							},
						],
					},
				},
				{
					$unwind: {
						path: '$voucher',
					},
				},
				{
					$lookup: {
						from: 'partner',
						localField: 'partner',
						foreignField: '_id',
						as: 'partner',
					},
				},
				{
					$unwind: {
						path: '$partner',
						preserveNullAndEmptyArrays: true,
					},
				},
				{
					$lookup: {
						from: 'member_promotion_histories',
						localField: '_id',
						foreignField: 'promotion',
						as: 'history',
						pipeline: [
							{
								$project: {
									_id: true,
								},
							},
						],
					},
				},
				{
					$project: {
						id: '$_id',
						_id: false,
						name: '$title',
						partnerImage: '$partner.image',
						backgroundImage: {
							$ifNull: ['$image', '$voucher.image'],
						},
						point: '$cost',
						expire: '$voucher.expireHour',
						partner: '$partner.name',
						from: { $toLong: '$startTime' },
						to: { $toLong: '$finishTime' },
						description: '$description',
						isFeatured: '$isFeatured',
						exchangeCount: {
							$size: '$history',
						},
					},
				},
			])
			.exec()
		return promotions.map(promotion => ({
			...promotion,
			...(promotion.partnerImage
				? { partnerImage: getImagePath(promotion.partnerImage) }
				: {}),
			...(promotion.backgroundImage
				? { backgroundImage: getImagePath(promotion.backgroundImage) }
				: {}),
		}))
	}
}

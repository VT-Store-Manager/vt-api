import { ClientSession, Model, Types } from 'mongoose'

import { getImagePath } from '@/common/helpers/file.helper'
import {
	MemberPromotionHistory,
	MemberPromotionHistoryDocument,
} from '@/schemas/member-promotion-history.schema'
import { MemberRank, MemberRankDocument } from '@/schemas/member-rank.schema'
import {
	MemberVoucher,
	MemberVoucherDocument,
} from '@/schemas/member-voucher.schema'
import {
	Promotion,
	PromotionDocument,
	ShortPromotion,
} from '@/schemas/promotion.schema'
import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { PromotionItemDTO } from './dto/response.dto'

@Injectable()
export class PromotionMemberService {
	constructor(
		@InjectModel(Promotion.name)
		private readonly promotionModel: Model<PromotionDocument>,
		@InjectModel(MemberRank.name)
		private readonly memberRankModel: Model<MemberRankDocument>,
		@InjectModel(MemberVoucher.name)
		private readonly memberVoucherModel: Model<MemberVoucherDocument>,
		@InjectModel(MemberPromotionHistory.name)
		private readonly memberPromotionHistoryModel: Model<MemberPromotionHistoryDocument>
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

	async exchangeVoucher(
		memberId: string,
		promotionId: string,
		session: ClientSession
	) {
		const memberRank = await this.memberRankModel
			.findOne({ member: new Types.ObjectId(memberId) })
			.orFail(new BadRequestException('Member rank not found'))
			.select('currentPoint rank')
			.lean()
			.exec()
		const promotions = await this.promotionModel
			.aggregate<
				ShortPromotion & {
					cost: number
					voucher: {
						_id: Types.ObjectId
						expireHour: number
						activeStartTime?: number
						activeFinishTime?: number
						deleted: boolean
					}
				}
			>([
				{
					$match: {
						_id: new Types.ObjectId(promotionId),
						deleted: false,
						disabled: false,
						startTime: {
							$lte: new Date(),
						},
						$and: [
							{
								$or: [
									{
										finishTime: {
											$gt: new Date(),
										},
									},
									{ finishTime: null },
								],
							},
							{
								$or: [
									{
										possibleTarget: [],
									},
									{
										possibleTarget: memberRank.rank,
									},
									{
										possibleTarget: new Types.ObjectId(memberId),
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
					},
				},
				{
					$unwind: {
						path: '$voucher',
						preserveNullAndEmptyArrays: true,
					},
				},
				{
					$lookup: {
						from: 'partners',
						localField: 'voucher.partner',
						foreignField: '_id',
						as: 'voucher.partner',
					},
				},
				{
					$unwind: {
						path: '$voucher.partner',
						preserveNullAndEmptyArrays: true,
					},
				},
				{
					$project: {
						title: true,
						description: true,
						image: true,
						cost: true,
						voucher: {
							id: '$voucher._id',
							title: true,
							code: true,
							image: true,
							partner: {
								id: '$voucher.partner._id',
								name: true,
								image: true,
							},
							expireHour: true,
							activeStartTime: {
								$toLong: '$voucher.activeStartTime',
							},
							activeFinishTime: {
								$toLong: '$voucher.activeFinishTime',
							},
							deleted: true,
						},
					},
				},
			])
			.exec()
		if (!promotions || promotions.length === 0) {
			throw new BadRequestException('Promotion not found')
		}

		const promotion = promotions[0]
		if (!promotion.voucher || promotion.voucher.deleted) {
			throw new BadRequestException('Voucher of promotion is invalid')
		}
		if (memberRank.currentPoint < promotion.cost) {
			throw new BadRequestException('Not enough point to exchange')
		}

		const startTimeUnix = promotion.voucher.activeStartTime || Date.now()
		const finishTimeUnix = promotion.voucher.activeFinishTime
			? Math.min(
					promotion.voucher.activeFinishTime,
					startTimeUnix + promotion.voucher.expireHour * 60 * 60 * 1000
			  )
			: startTimeUnix + promotion.voucher.expireHour * 60 * 60 * 1000
		const [updatePointResult, _createdMemberVoucher, _createdPromotionHistory] =
			await Promise.all([
				this.memberRankModel
					.updateOne(
						{ member: new Types.ObjectId(memberId) },
						{
							$inc: {
								currentPoint: -promotion.cost,
								usedPoint: promotion.cost,
							},
						},
						{ session }
					)
					.exec(),
				this.memberVoucherModel.create<MemberVoucher>(
					[
						{
							member: new Types.ObjectId(memberId),
							voucher: promotion.voucher.id,
							startTime: new Date(startTimeUnix),
							finishTime: new Date(finishTimeUnix),
						},
					],
					{ session }
				),
				this.memberPromotionHistoryModel.create<MemberPromotionHistory>(
					[
						{
							member: new Types.ObjectId(memberId),
							promotion: new Types.ObjectId(promotionId),
							promotionData: promotion,
						},
					],
					{ session }
				),
			])
		if (updatePointResult.modifiedCount === 0) {
			throw new InternalServerErrorException('Update point cause error')
		}
		return true
	}
}

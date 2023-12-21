import { isObjectIdOrHexString, Types } from 'mongoose'
import { SoftDeleteModel } from 'mongoose-delete'

import { keyCodePattern } from '@app/common'
import {
	Member,
	MemberDocument,
	MemberRank,
	MemberRankDocument,
} from '@app/database'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { GetMemberListPaginationDTO } from './dto/get-member-list-pagination.dto'
import { MemberItemDTO, MemberListPaginationDTO } from './dto/response.dto'

@Injectable()
export class MemberService {
	constructor(
		@InjectModel(Member.name)
		private readonly memberModel: SoftDeleteModel<MemberDocument>,
		@InjectModel(MemberRank.name)
		private readonly memberRankModel: SoftDeleteModel<MemberRankDocument>
	) {}

	async getListPagination(
		query: GetMemberListPaginationDTO
	): Promise<MemberListPaginationDTO> {
		const [totalCount, productList] = await Promise.all([
			this.memberModel.count().exec(),
			this.memberModel
				.aggregate<MemberItemDTO>([
					{
						$skip: (query.page - 1) * query.limit,
					},
					{
						$limit: query.limit,
					},
					{
						$project: {
							id: '$_id',
							_id: false,
							name: {
								$concat: ['$firstName', ' ', '$lastName'],
							},
							gender: true,
							phone: true,
							createdAt: {
								$toLong: '$createdAt',
							},
						},
					},
					{
						$lookup: {
							from: 'member_ranks',
							localField: 'id',
							foreignField: 'member',
							as: 'rank',
							pipeline: [
								{
									$lookup: {
										from: 'ranks',
										localField: 'rank',
										foreignField: '_id',
										as: 'info',
										pipeline: [
											{
												$project: {
													id: '$_id',
													_id: false,
													name: true,
													rank: true,
													appearance: true,
												},
											},
										],
									},
								},
								{
									$unwind: {
										path: '$info',
									},
								},
								{
									$project: {
										_id: false,
										code: true,
										info: true,
										currentPoint: true,
										usedPoint: true,
										expiredPoint: true,
									},
								},
							],
						},
					},
					{
						$unwind: {
							path: '$rank',
							preserveNullAndEmptyArrays: true,
						},
					},
				])
				.exec(),
		])
		return {
			totalCount,
			items: productList,
		}
	}

	async getMemberDetail(memberIdOrCode: string) {
		const { member: memberId } = await this.memberRankModel
			.findOne(
				isObjectIdOrHexString(memberIdOrCode)
					? { member: new Types.ObjectId(memberIdOrCode) }
					: { code: memberIdOrCode }
			)
			.orFail(new BadRequestException('ID hoặc mã thành viên không hợp lệ'))
			.select('member')
			.lean()
			.exec()

		const [member] = await this.memberModel
			.aggregateWithDeleted([
				{
					$match: {
						_id: memberId,
					},
				},
				{
					$lookup: {
						from: 'member_promotion_histories',
						localField: '_id',
						foreignField: 'member',
						as: 'promotionHistories',
						pipeline: [
							{
								$lookup: {
									from: 'promotions',
									localField: 'promotion',
									foreignField: '_id',
									as: 'promotion',
									pipeline: [
										{
											$lookup: {
												from: 'vouchers',
												localField: 'voucher',
												foreignField: '_id',
												as: 'voucher',
												pipeline: [
													{
														$project: {
															id: { $toString: '$_id' },
															_id: false,
															code: true,
															title: true,
															image: true,
														},
													},
												],
											},
										},
										{
											$unwind: {
												path: '$voucher',
												preserveNullAndEmptyArrays: true,
											},
										},
									],
								},
							},
							{
								$unwind: {
									path: '$promotion',
									preserveNullAndEmptyArrays: true,
								},
							},
							{
								$project: {
									_id: false,
									title: {
										$ifNull: ['$promotionData.title', '$promotion.title'],
									},
									description: {
										$ifNull: [
											'$promotionData.description',
											'$promotion.description',
										],
									},
									cost: {
										$ifNull: ['$promotionData.cost', '$promotion.cost'],
									},
									image: {
										$ifNull: ['$promotion.image', '$promotion.voucher.image'],
									},
									voucher: '$promotion.voucher',
									createdAt: true,
								},
							},
							{
								$sort: {
									createdAt: -1,
								},
							},
						],
					},
				},
				{
					$lookup: {
						from: 'member_data',
						localField: '_id',
						foreignField: 'member',
						as: 'memberData',
						pipeline: [
							{
								$project: {
									_id: false,
									favoriteProducts: true,
									favoriteStores: true,
									address: true,
									notifications: true,
								},
							},
						],
					},
				},
				{
					$unwind: '$memberData',
				},
				{
					$lookup: {
						from: 'member_ranks',
						localField: '_id',
						foreignField: 'member',
						as: 'memberRank',
						pipeline: [
							{
								$lookup: {
									from: 'ranks',
									localField: 'rank',
									foreignField: '_id',
									as: 'rank',
									pipeline: [
										{
											$project: {
												id: { $toString: '$_id' },
												_id: false,
												name: true,
												appearance: true,
											},
										},
									],
								},
							},
							{
								$unwind: '$rank',
							},
							{
								$project: {
									_id: false,
									code: true,
									rank: true,
									usedPoint: true,
									currentPoint: true,
									expiredPoint: true,
								},
							},
						],
					},
				},
				{
					$unwind: '$memberRank',
				},
				{
					$lookup: {
						from: 'orders',
						localField: '_id',
						foreignField: 'member.id',
						as: 'orders',
						pipeline: [
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
											{
												$subtract: ['$deliveryPrice', '$deliveryDiscount'],
											},
										],
									},
									payType: '$payment',
									time: { $toLong: '$createdAt' },
									store: true,
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
													$subtract: [
														'$$item.unitPrice',
														'$$item.unitSalePrice',
													],
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
									createdAt: true,
								},
							},
							{
								$sort: {
									createdAt: -1,
								},
							},
						],
					},
				},
				{
					$lookup: {
						from: 'member_vouchers',
						localField: '_id',
						foreignField: 'member',
						as: 'vouchers',
						pipeline: [
							{
								$match: {
									disabled: { $ne: true },
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
												deleted: { $ne: true },
											},
										},
										{
											$project: {
												id: { $toString: '$_id' },
												_id: false,
												code: true,
												title: true,
												image: true,
												disabled: true,
											},
										},
									],
								},
							},
							{
								$unwind: '$voucher',
							},
							{
								$project: {
									id: { $toString: '$_id' },
									_id: false,
									voucher: true,
									startTime: true,
									finishTime: true,
									createdAt: true,
								},
							},
						],
					},
				},
				{
					$project: {
						id: { $toString: '$_id' },
						_id: false,
						name: {
							$concat: ['$firstName', ' ', '$lastName'],
						},
						gender: true,
						dob: true,
						deleted: true,
						deletedAt: true,
						createdAt: true,
						phone: true,
						promotionHistories: true,
						memberData: true,
						memberRank: true,
						orders: true,
						vouchers: true,
					},
				},
			])
			.exec()

		if (!member) {
			throw new BadRequestException('Không tìm thấy thành viên')
		}

		return member
	}
}

import { ClientSession, Model, Types } from 'mongoose'

import { SettingMemberAppService } from '@app/common'
import {
	MemberRank,
	MemberRankDocument,
	Promotion,
	PromotionDocument,
	Rank,
	RankDocument,
	Voucher,
	VoucherDocument,
} from '@app/database'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { CreatePromotionDTO } from './dto/create-promotion.dto'
import { GetPromotionListDTO } from './dto/get-promotion-list.dto'
import {
	PromotionItemDTO,
	PromotionListPaginationDTO,
} from './dto/response.dto'

@Injectable()
export class PromotionService {
	constructor(
		@InjectModel(Promotion.name)
		private readonly promotionModel: Model<PromotionDocument>,
		@InjectModel(Voucher.name)
		private readonly voucherModel: Model<VoucherDocument>,
		@InjectModel(MemberRank.name)
		private readonly memberRankModel: Model<MemberRankDocument>,
		@InjectModel(Rank.name)
		private readonly rankModel: Model<RankDocument>,
		private readonly settingMemberAppService: SettingMemberAppService
	) {}

	async create(data: CreatePromotionDTO, session?: ClientSession) {
		const [voucherCount, targetMember, targetRank] = await Promise.all([
			this.voucherModel.findById(data.voucher).count().exec(),
			this.memberRankModel
				.find({
					$or: [
						{
							member: {
								$in: data.possibleTarget.map(id => new Types.ObjectId(id)),
							},
						},
						{
							rank: {
								$in: data.possibleTarget.map(id => new Types.ObjectId(id)),
							},
						},
					],
				})
				.count()
				.exec(),
			this.rankModel
				.find({
					_id: { $in: data.possibleTarget.map(id => new Types.ObjectId(id)) },
				})
				.count()
				.exec(),
		])
		if (!voucherCount) {
			throw new BadRequestException('Voucher not found')
		}
		if (data.possibleTarget.length > 0 && targetMember + targetRank === 0) {
			throw new BadRequestException('Possible target not found')
		}

		const [newPromotion] = await this.promotionModel.create(
			[{ ...data }],
			session ? { session } : {}
		)
		return newPromotion
	}

	async getPromotionList(
		query: GetPromotionListDTO
	): Promise<PromotionListPaginationDTO> {
		const [totalCount, { defaultImages }, promotionList] = await Promise.all([
			this.promotionModel.count().exec(),
			this.settingMemberAppService.getData({
				defaultImages: { voucher: true },
			}),
			this.promotionModel
				.aggregate<PromotionItemDTO>([
					{
						$unwind: {
							path: '$possibleTarget',
							preserveNullAndEmptyArrays: true,
						},
					},
					{
						$lookup: {
							from: 'ranks',
							localField: 'possibleTarget',
							foreignField: '_id',
							as: 'rank',
							pipeline: [
								{
									$project: {
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
							path: '$rank',
							preserveNullAndEmptyArrays: true,
						},
					},
					{
						$lookup: {
							from: 'member_ranks',
							localField: 'possibleTarget',
							foreignField: 'member',
							as: 'member',
							pipeline: [
								{
									$project: {
										_id: false,
										code: true,
									},
								},
							],
						},
					},
					{
						$unwind: {
							path: '$member',
							preserveNullAndEmptyArrays: true,
						},
					},
					{
						$group: {
							_id: '$_id',
							id: { $first: '$_id' },
							image: { $first: '$image' },
							voucher: { $first: '$voucher' },
							cost: { $first: '$cost' },
							isFeatured: { $first: '$isFeatured' },
							disabled: { $first: '$disabled' },
							deleted: { $first: '$deleted' },
							updatedAt: { $first: { $toLong: '$updatedAt' } },
							startTime: { $first: { $toLong: '$startTime' } },
							finishTime: { $first: { $toLong: '$finishTime' } },
							ranks: { $push: '$rank' },
							members: { $push: '$member.code' },
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
									$project: {
										id: '$_id',
										_id: false,
										code: true,
										title: true,
										disabled: true,
										deleted: true,
										images: ['$image'],
										activeStartTime: {
											$toLong: '$activeStartTime',
										},
										activeFinishTime: {
											$toLong: '$activeFinishTime',
										},
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
					{
						$project: { _id: false },
					},
					{
						$sort: {
							id: 1,
						},
					},
					{ $skip: (query.page - 1) * query.limit },
					{ $limit: query.limit },
				])
				.exec(),
		])

		promotionList.forEach(promotion => {
			promotion.voucher.images.push(defaultImages.voucher)
		})

		return {
			totalCount: totalCount,
			items: promotionList,
		}
	}
}

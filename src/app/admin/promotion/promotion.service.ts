import { ClientSession, Model, Types } from 'mongoose'

import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { MemberRank, MemberRankDocument } from '@schema/member-rank.schema'
import { Promotion, PromotionDocument } from '@schema/promotion.schema'
import { Rank, RankDocument } from '@schema/rank.schema'
import { Voucher, VoucherDocument } from '@schema/voucher.schema'

import { CreatePromotionDTO } from './dto/create-promotion.dto'

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
		private readonly rankModel: Model<RankDocument>
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
}
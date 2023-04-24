import { ClientSession, Model, Types } from 'mongoose'

import { MemberRank, MemberRankDocument } from '@/schemas/member-rank.schema'
import { Promotion, PromotionDocument } from '@/schemas/promotion.schema'
import { Voucher, VoucherDocument } from '@/schemas/voucher.schema'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { CreatePromotionDTO } from './dto/create-promotion.dto'

@Injectable()
export class PromotionAdminService {
	constructor(
		@InjectModel(Promotion.name)
		private readonly promotionModel: Model<PromotionDocument>,
		@InjectModel(Voucher.name)
		private readonly voucherModel: Model<VoucherDocument>,
		@InjectModel(MemberRank.name)
		private readonly memberRankModel: Model<MemberRankDocument>
	) {}

	async create(data: CreatePromotionDTO, session?: ClientSession) {
		const [voucherCount, targetByMember, targetByRank] = await Promise.all([
			this.voucherModel.findById(data.voucher).count().exec(),
			this.memberRankModel
				.find({
					member: {
						$in: data.possibleTarget.map(id => new Types.ObjectId(id)),
					},
				})
				.count()
				.exec(),
			this.memberRankModel
				.find({
					rank: { $in: data.possibleTarget.map(id => new Types.ObjectId(id)) },
				})
				.count()
				.exec(),
		])
		if (!voucherCount) {
			throw new BadRequestException('Voucher not found')
		}
		if (data.possibleTarget.length > 0 && targetByMember + targetByRank === 0) {
			throw new BadRequestException('Possible target not found')
		}

		const [newPromotion] = await this.promotionModel.create(
			[{ ...data }],
			session ? { session } : {}
		)
		return newPromotion
	}
}

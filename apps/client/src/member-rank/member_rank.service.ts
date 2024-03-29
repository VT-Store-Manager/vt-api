import { Model, Types } from 'mongoose'

import {
	colorHexToInt,
	DEFAULT_POINT_NAME,
	FileService,
	IS_ZERO_POINT_MESSAGE,
	RANK_MESSAGE_SPLIT,
} from '@app/common'
import {
	Member,
	MemberDocument,
	MemberRank,
	MemberRankDocument,
	Rank,
	RankDocument,
} from '@app/database'
import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { MemberRankCardDTO } from './dto/response.dto'

@Injectable()
export class MemberRankService {
	constructor(
		@InjectModel(Member.name)
		private readonly memberModel: Model<MemberDocument>,
		@InjectModel(Rank.name)
		private readonly rankModel: Model<RankDocument>,
		@InjectModel(MemberRank.name)
		private readonly memberRankModel: Model<MemberRankDocument>,
		private readonly fileService: FileService
	) {}

	private getRankMessage(
		script: string | null | undefined,
		dict: Record<string, string | number | null | undefined>
	) {
		if (!script) return ''
		return Object.keys(dict).reduce((result, key) => {
			const value = dict[key]
			if (value === null || value === undefined) {
				return result
			}

			const keyPattern = new RegExp(`{{\\s*${key}\\s*}}`)
			return result.replace(keyPattern, dict[key] + '')
		}, script)
	}

	async getMemberRankCard(memberId: string): Promise<MemberRankCardDTO> {
		const [member, memberRank] = await Promise.all([
			this.memberModel
				.findById(memberId)
				.select({
					id: '$_id',
					firstName: true,
					lastName: true,
				})
				.lean({ virtuals: true })
				.exec(),
			this.memberRankModel
				.findOne({ member: new Types.ObjectId(memberId) })
				.populate<{ rank: Rank }>('rank')
				.select('rank usedPoint expiredPoint currentPoint deliveryFee code')
				.lean({ virtuals: true })
				.exec(),
		])

		if (!memberRank.rank) {
			throw new InternalServerErrorException('Member rank data error')
		}
		const nextRank = await this.rankModel
			.findOne({ rank: memberRank.rank.rank + 1 })
			.lean()
			.exec()
		const rankMessage = this.getRankMessage(memberRank.rank.message, {
			POINT_NAME: DEFAULT_POINT_NAME,
			TOTAL_POINT: memberRank.totalPoint,
			CURRENT_POINT: memberRank.currentPoint,
			USED_POINT: memberRank.usedPoint,
			EXPIRED_POINT: memberRank.expiredPoint,
			CURRENT_RANK: memberRank.rank.name,
			CURRENT_RANK_POINT: memberRank.rank.minPoint,
			NEXT_RANK: nextRank?.name,
			NEXT_RANK_POINT: nextRank?.minPoint,
			EXTRA_POINT: nextRank ? nextRank.minPoint - memberRank.totalPoint : null,
			IS_ZERO_POINT:
				memberRank.totalPoint === 0
					? `${RANK_MESSAGE_SPLIT}${IS_ZERO_POINT_MESSAGE}`
					: '',
		})
		return {
			id: member._id.toString(),
			name: member.fullName,
			code: memberRank.code,
			point: memberRank.totalPoint,
			currentPoint: memberRank.currentPoint,
			currentRankPoint: memberRank.rank.minPoint,
			currentRankName: memberRank.rank.name,
			nextRankPoint: nextRank ? nextRank.minPoint : null,
			nextRankName: nextRank ? nextRank.name : null,
			backgroundImage: this.fileService.getImageUrl(
				memberRank.rank.appearance.background
			),
			description: rankMessage,
			color: colorHexToInt(memberRank.rank.appearance.color),
			fee: memberRank.rank.deliveryFee ?? 0,
		}
	}
}

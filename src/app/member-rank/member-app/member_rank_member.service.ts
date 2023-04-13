import { Model, Types } from 'mongoose'

import { MemberRank, MemberRankDocument } from '@/schemas/member-rank.schema'
import { Member, MemberDocument } from '@/schemas/member.schema'
import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { MemberRankCardDTO } from './dto/response.dto'
import { Rank, RankDocument } from '@/schemas/rank.schema'
import {
	DEFAULT_POINT_NAME,
	IS_ZERO_POINT_MESSAGE,
	RANK_MESSAGE_SPLIT,
} from '@/common/constants'

@Injectable()
export class MemberRankMemberService {
	constructor(
		@InjectModel(Member.name)
		private readonly memberModel: Model<MemberDocument>,
		@InjectModel(Rank.name)
		private readonly rankModel: Model<RankDocument>,
		@InjectModel(MemberRank.name)
		private readonly memberRankModel: Model<MemberRankDocument>
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
				.select('rank usedPoint expiredPoint currentPoint')
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
			scores: memberRank.totalPoint,
			rankName: memberRank.rank.name,
			nextRankName: nextRank ? nextRank.name : null,
			background: memberRank.rank.appearance.background,
			nextRank: nextRank ? nextRank.minPoint : null,
			status: rankMessage,
		}
	}
}

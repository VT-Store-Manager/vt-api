import { Gender } from '@/common/constants'
import { Rank } from '@/database/schemas/rank.schema'
import { PickType } from '@nestjs/swagger'

export class MemberRankItemDTO extends PickType(Rank, [
	'name',
	'rank',
	'appearance',
] as const) {}

export class MemberItemDTO {
	id: string
	name: string
	gender: Gender
	phone: string
	createdAt: number
	code: string
	rank: {
		code: string
		currentPoint: number
		usedPoint: number
		expiredPoint: number
		info: MemberRankItemDTO
	}
}

export class MemberListPaginationDTO {
	maxCount: number
	items: MemberItemDTO[]
}

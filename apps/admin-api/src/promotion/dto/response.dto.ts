import { Rank } from '@app/database'
import { PickType } from '@nestjs/swagger'

export class Voucher {
	title: string
	disabled: boolean
	deleted: boolean
	images: string[]
	id: string
	activeStartTime: number
	activeFinishTime: number
}

export class RankPromotionItem extends PickType(Rank, [
	'name',
	'rank',
	'appearance',
] as const) {}

export class PromotionItemDTO {
	id: string
	image: string
	voucher: Voucher
	cost: number
	isFeatured: boolean
	disabled: boolean
	deleted: boolean
	updatedAt: number
	startTime: number
	finishTime?: number
	ranks: RankPromotionItem[]
	members: string[]
}

export class PromotionListPaginationDTO {
	totalCount: number
	items: PromotionItemDTO[]
}

import { Rank } from '@app/database'
import { PickType } from '@nestjs/swagger'

export class RankItemDTO extends PickType(Rank, [
	'name',
	'rank',
	'appearance',
	'minPoint',
	'coefficientPoint',
	'deliveryFee',
] as const) {
	updatedAt: number
	id: string
	memberNumber: number
}

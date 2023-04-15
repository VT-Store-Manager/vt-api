export class MemberRankCardDTO {
	id: string
	name: string
	code: string
	point: number
	currentRankPoint: number
	currentRankName: string
	nextRankPoint: number | null
	nextRankName: string | null
	backgroundImage: string
	description: string
	color: number
	fee: number
}

export class PromotionItemDTO {
	id: string
	name: string
	partnerImage: string
	backgroundImage: string
	point: number
	expire: number
	partner?: string
	from: number
	to: number
	description: string
	isFeatured: boolean
	exchangedCount: number
}

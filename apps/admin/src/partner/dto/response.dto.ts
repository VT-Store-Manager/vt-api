export class PartnerListPaginationDTO {
	totalCount: number
	items: PartnerListItemDTO[]
}

export class PartnerListItemDTO {
	id: string
	code: string
	name: string
	createdAt: Date
	updatedAt: Date
}

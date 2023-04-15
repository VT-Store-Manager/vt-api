export class ProductItemDTO {
	id: string
	name: string
	cost: number
	disable: boolean
}

export class GetAllProductOptionDTO {
	id: string
	name: string
	minSelected: number
	maxSelected: number
	default: string[]
	optionItemIds: ProductItemDTO[]
}

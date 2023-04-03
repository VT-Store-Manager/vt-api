export class ShortProductItemDTO {
	id: string
	name: string
	mainImage: string
	price: number
}

export class DetailProductDTO {
	id: string
	name: string
	mainImage: string
	images: string[]
	description: string
	isFavorite: boolean
	price: number
	optionIDs: string[]
}

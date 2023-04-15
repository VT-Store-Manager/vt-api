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

export class ProductListItemDTO {
	id: string
	name: string
	cost: number
	image: string
	images: string[]
	optionIds: string[]
	description: string
}

export class ProductSuggestionDTO {
	products: string[]
}

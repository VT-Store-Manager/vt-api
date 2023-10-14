export class ShortStoreItemDTO {
	id: string
	name: string
	image: string
	address: string
	lat: number
	lng: number
	brandName?: string
	isFavorite: boolean
}

export class StoreDetailDTO {
	id: string
	openTime: string
	phone: string
	lat?: number
	lng?: number
	images: string[]
	mapImage?: string
	unavailableProducts: string[]
	unavailableCategories: string[]
	unavailableOptions: string[]
}

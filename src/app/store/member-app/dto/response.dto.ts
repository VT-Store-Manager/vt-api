import { Address } from '@/schemas/store.schema'

export class ShortStoreItemDTO {
	id: string
	name: string
	mainImage: string
	fullAddress: string
	distance: number
}

export class StoreDetailDTO {
	id: string
	mainImage: string
	images: string[]
	dailyTime: string
	address: Address
	fullAddress: string
	contact: string
	brandName: string
	distance: number
}

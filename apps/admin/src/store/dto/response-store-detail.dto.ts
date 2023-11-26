import { Product, Store } from '@app/database'
import { OmitType, PickType } from '@nestjs/swagger'

export class UnavailableProductDTO extends PickType(Product, [
	'name',
	'originalPrice',
	'category',
	'deleted',
	'disabled',
] as const) {
	id: string
	image: string
}

export class ResponseStoreDetailDTO extends OmitType(Store, [
	'_id',
	'unavailableGoods',
] as const) {
	id: string
	unavailableGoods: {
		product: UnavailableProductDTO[]
		category: string[]
		option: string[]
	}
}

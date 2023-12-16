import { Store } from '@app/database'
import { OmitType } from '@nestjs/swagger'

export class ResponseStoreDetailDTO extends OmitType(Store, [
	'_id',
	'unavailableGoods',
] as const) {
	id: string
	unavailableGoods: {
		product: string[]
		category: string[]
		option: string[]
	}
}

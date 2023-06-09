import { Store } from '@schema/store.schema'
import { PickType } from '@nestjs/swagger'

export class ResponseStoreItem extends PickType(Store, [
	'images',
	'name',
	'address',
	'updatedAt',
	'openedStatus',
	'disabled',
	'deleted',
] as const) {
	id: string
}

export class ResponseStoreListDTO {
	items: ResponseStoreItem[]
	maxCount: number
}

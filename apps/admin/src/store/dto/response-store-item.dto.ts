import { Store } from '@app/database'
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
	totalCount: number
}

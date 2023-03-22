import { Store } from '@/schemas/store.schema'
import { PickType } from '@nestjs/swagger'
export class ResponseStoreItemDto extends PickType(Store, [
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

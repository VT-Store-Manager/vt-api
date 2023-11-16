import { Shipper } from '@app/database'
import { OmitType } from '@nestjs/swagger'

export class ShipperListPagination {
	totalCount: number
	items: ShipperListItem[]
}

export class ShipperListItem extends OmitType(Shipper, [
	'_id',
	'deleted',
	'deletedAt',
	'deletedBy',
] as const) {
	id: string
}

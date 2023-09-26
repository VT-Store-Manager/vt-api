import { Status } from '@app/common'
import { ProductOption } from '@app/database'
import { PickType } from '@nestjs/swagger'

export class ProductOptionListItemDTO extends PickType(ProductOption, [
	'code',
	'name',
	'parent',
	'range',
	'items',
] as const) {
	id: string
	applying: number
	status: Status
}

export class ProductOptionListPagination {
	totalCount: number
	items: ProductOptionListItemDTO[]
}

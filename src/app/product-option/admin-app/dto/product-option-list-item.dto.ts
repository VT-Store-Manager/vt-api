import { Status } from '@/common/constants'
import { ProductOption } from '@/schemas/product-option.schema'
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

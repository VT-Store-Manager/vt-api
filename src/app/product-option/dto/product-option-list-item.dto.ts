import { ProductOption } from '@/schemas/product-option.schema'
import { PickType } from '@nestjs/swagger'

export class ProductOptionListItemDto extends PickType(ProductOption, [
	'code',
	'name',
	'range',
	'deleted',
] as const) {
	id: string
	parent: string
}

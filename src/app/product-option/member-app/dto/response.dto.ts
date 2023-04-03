import { ProductOption } from '@/schemas/product-option.schema'
import { PickType } from '@nestjs/swagger'

export class GetAllProductOptionDTO extends PickType(ProductOption, [
	'name',
	'range',
	'items',
] as const) {
	id: string
}

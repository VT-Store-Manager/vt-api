import { ProductOption } from '@/schemas/product-option.schema'
import { Product } from '@/schemas/product.schema'
import { PickType } from '@nestjs/swagger'

export class ApplyingProductInfo extends PickType(Product, [
	'code',
	'name',
	'disabled',
	'deleted',
] as const) {
	id: string
}

export class ProductOptionShortInfo extends PickType(ProductOption, [
	'code',
	'name',
	'disabled',
	'deleted',
] as const) {
	id: string
}

export class ProductOptionDetailDto extends PickType(ProductOption, [
	'code',
	'name',
	'range',
	'disabled',
	'deleted',
	'deletedAt',
	'createdAt',
	'updatedAt',
] as const) {
	id: string
	parent: ProductOptionShortInfo
	children: ProductOptionShortInfo[]
	applyingProducts: ApplyingProductInfo[]
	boughtAmount: number
}

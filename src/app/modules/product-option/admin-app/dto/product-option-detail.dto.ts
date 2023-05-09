import { ProductOption } from '@schema/product-option.schema'
import { Product } from '@schema/product.schema'
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

export class ProductOptionDetailDTO extends PickType(ProductOption, [
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

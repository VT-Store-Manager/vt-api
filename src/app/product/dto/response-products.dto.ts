import { Status } from '@/common/constants'
import { ProductCategory } from '@/schemas/product-category.schema'
import { Product } from '@/schemas/product.schema'
import { PickType } from '@nestjs/swagger'

class ShortProductCategory extends PickType(ProductCategory, ['code', 'name']) {
	id: string
}

class SaleVolumn {
	month: number
}

export class ResponseProductItemDTO extends PickType(Product, [
	'name',
	'images',
	'originalPrice',
	'updatedAt',
] as const) {
	id: string
	category: ShortProductCategory
	salesVolumn: SaleVolumn
	status: Status
}

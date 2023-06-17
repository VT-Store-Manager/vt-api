import { Status } from '@/common/constants'
import { ProductCategory } from '@schema/product-category.schema'
import { Product } from '@schema/product.schema'
import { PickType } from '@nestjs/swagger'

class ShortProductCategory extends PickType(ProductCategory, ['code', 'name']) {
	id: string
}

class SaleVolume {
	month: number
}

export class ProductListItemDTO extends PickType(Product, [
	'name',
	'images',
	'originalPrice',
	'updatedAt',
] as const) {
	id: string
	category: ShortProductCategory
	salesVolume: SaleVolume
	status: Status
}

export class ProductListPaginationDTO {
	totalCount: number
	items: ProductListItemDTO[]
}

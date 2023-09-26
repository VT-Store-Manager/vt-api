import { Status } from '@app/common'
import { Product, ProductCategory } from '@app/database'
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
	list: ProductListItemDTO[]
}

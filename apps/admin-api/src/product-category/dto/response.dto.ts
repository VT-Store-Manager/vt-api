import { StatusText } from '@app/common'
import { ProductCategory } from '@app/database'
import { SelectDataModel } from '@app/types'
import { OmitType } from '@nestjs/swagger'

export class ProductCategoryListPaginationDTO {
	totalCount: number
	items: ProductCategoryListItemDTO[]
}

export class ProductCategoryListItemDTO {
	id: string
	name: string
	image: string
	code: number
	status: StatusText
	amountOfProduct: number
	totalSold: number
	soldOfWeek: number
	order: number
	featured: boolean
	updatedAt: number
}

export class ProductCategorySelectDataDTO extends SelectDataModel {
	image: string
}

export class ProductCategoryDetailDTO extends OmitType(ProductCategory, [
	'_id',
	'code',
]) {
	id: string
}

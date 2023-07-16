import { StatusText } from '@app/common'
import { SelectDataModel } from '@app/types'

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

import { StatusText } from '@/common/constants'
import { SelectDataModel } from '../../../../types/index'

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

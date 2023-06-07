import { StatusText } from '@/common/constants'

export class ProductCategoryListPaginationDTO {
	totalCount: number
	list: ProductCategoryListItemDTO[]
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

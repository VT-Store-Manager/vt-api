export type ArrElement<ArrType> = ArrType extends readonly (infer ElementType)[]
	? ElementType
	: never

export class QueryListDTO {
	page?: number
	limit?: number
	keyword?: string
	sortBy?: string
}

export class SelectDataModel {
	title: string
	value: string
	disabled?: boolean
}

export class PaginationModel<T extends Record<string, any>> {
	totalCount: number
	items: T[]
}

export type ArrElement<ArrType> = ArrType extends readonly (infer ElementType)[]
	? ElementType
	: never

export class QueryListDTO {
	page?: number
	limit?: number
	keyword?: string
	sortBy?: string
}

import { QueryListDTO } from '@/types'
import { PickType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsPositive } from 'class-validator'

export class GetProductCategoryPaginationDTO extends PickType(QueryListDTO, [
	'page',
	'limit',
] as const) {
	@Type(() => Number)
	@IsPositive()
	page?: number = 1

	@Type(() => Number)
	@IsPositive()
	limit?: number = 10
}

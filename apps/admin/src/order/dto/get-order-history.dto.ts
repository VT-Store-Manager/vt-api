import { Type } from 'class-transformer'
import { IsEnum, IsMongoId, IsOptional, IsPositive } from 'class-validator'

import { SortOrder } from '@app/common'
import { QueryListDTO } from '@app/types'
import { PickType } from '@nestjs/swagger'

export class GetOrderHistoryPaginationDTO extends PickType(QueryListDTO, [
	'page',
	'limit',
] as const) {
	@Type(() => Number)
	@IsPositive()
	page?: number = 1

	@Type(() => Number)
	@IsPositive()
	limit?: number = 10

	@IsOptional()
	@IsMongoId()
	store?: string

	@IsOptional()
	@Type(() => Number)
	@IsPositive()
	from?: number

	@IsOptional()
	@Type(() => Number)
	@IsPositive()
	to?: number

	@IsOptional()
	@Type(() => Number)
	@IsEnum(SortOrder)
	order?: SortOrder = SortOrder.DESC
}

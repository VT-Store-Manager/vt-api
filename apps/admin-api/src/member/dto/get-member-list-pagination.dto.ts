import { Type } from 'class-transformer'
import { IsOptional, IsPositive } from 'class-validator'

import { QueryListDTO } from '@app/types'
import { PickType } from '@nestjs/swagger'

export class GetMemberListPaginationDTO extends PickType(QueryListDTO, [
	'page',
	'limit',
] as const) {
	@Type(() => Number)
	@IsPositive()
	@IsOptional()
	page?: number = 1

	@Type(() => Number)
	@IsPositive()
	@IsOptional()
	limit?: number = 20
}

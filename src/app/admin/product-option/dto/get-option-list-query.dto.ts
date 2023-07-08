import { Type } from 'class-transformer'
import { IsPositive } from 'class-validator'

import { QueryListDTO } from '@/types'
import { PickType } from '@nestjs/swagger'

export class GetOptionListQueryDTO extends PickType(QueryListDTO, [
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

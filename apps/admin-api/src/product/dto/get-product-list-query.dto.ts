import { Type } from 'class-transformer'
import { IsPositive } from 'class-validator'

import { QueryListDTO } from '@app/types'
import { PickType } from '@nestjs/swagger'

export class GetProductListQueryDTO extends PickType(QueryListDTO, [
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

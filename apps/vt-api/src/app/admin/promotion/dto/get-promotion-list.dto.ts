import { Type } from 'class-transformer'
import { IsOptional, IsPositive } from 'class-validator'

import { QueryListDTO } from '@/types'
import { PickType } from '@nestjs/swagger'

export class GetPromotionListDTO extends PickType(QueryListDTO, [
	'page',
	'limit',
] as const) {
	@Type(() => Number)
	@IsOptional()
	@IsPositive()
	page = 1

	@Type(() => Number)
	@IsOptional()
	@IsPositive()
	limit = 20
}

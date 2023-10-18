import { QueryTime } from '@app/common'
import { Type } from 'class-transformer'
import { IsEnum, IsOptional, IsPositive } from 'class-validator'

export class GetOrderByStateDTO {
	@IsOptional()
	@Type(() => Number)
	@IsPositive()
	page?: number = 1

	@IsOptional()
	@Type(() => Number)
	@IsPositive()
	limit?: number = 20

	@IsOptional()
	@Type(() => Number)
	@IsEnum(QueryTime)
	time?: QueryTime = QueryTime.EVERY_TIME
}

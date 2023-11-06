import { Type } from 'class-transformer'
import { IsOptional, IsPositive } from 'class-validator'

export class GetSlideQueryDTO {
	@IsOptional()
	@Type(() => Number)
	@IsPositive()
	limit?: number
}

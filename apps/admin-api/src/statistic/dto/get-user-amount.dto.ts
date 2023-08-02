import { Type } from 'class-transformer'
import { IsOptional, IsPositive } from 'class-validator'

export class GetUserAmountDTO {
	@Type(() => Number)
	@IsPositive()
	@IsOptional()
	duration = 30
}

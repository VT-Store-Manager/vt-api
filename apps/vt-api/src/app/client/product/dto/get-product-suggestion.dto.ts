import { Type } from 'class-transformer'
import { IsOptional, IsPositive } from 'class-validator'

export class GetProductSuggestionDTO {
	@IsPositive()
	@IsOptional()
	@Type(() => Number)
	limit? = 4
}

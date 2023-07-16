import { Type } from 'class-transformer'
import { IsOptional, IsPositive } from 'class-validator'

export class GetListStoreDTO {
	@Type(() => Number)
	@IsPositive()
	@IsOptional()
	page = 1

	@Type(() => Number)
	@IsPositive()
	@IsOptional()
	limit = 6
}

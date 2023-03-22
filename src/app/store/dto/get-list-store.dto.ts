import { Type } from 'class-transformer'
import { IsNumber, IsOptional, Min } from 'class-validator'

export class GetListStoreDto {
	@IsNumber()
	@Type(() => Number)
	@Min(1)
	@IsOptional()
	page = 1

	@IsNumber()
	@Type(() => Number)
	@Min(6)
	@IsOptional()
	limit = 6
}

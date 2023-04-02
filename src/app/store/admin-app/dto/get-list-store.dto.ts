import { Type } from 'class-transformer'
import { IsNumber, IsOptional, Min } from 'class-validator'

export class GetListStoreDTO {
	@IsNumber()
	@Type(() => Number)
	@Min(1)
	@IsOptional()
	page = 1

	@IsNumber()
	@Type(() => Number)
	@Min(1)
	@IsOptional()
	limit = 6
}

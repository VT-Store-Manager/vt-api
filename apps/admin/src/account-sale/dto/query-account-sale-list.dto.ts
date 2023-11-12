import { Type } from 'class-transformer'
import { IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator'

export class QueryAccountSaleListDTO {
	@IsOptional()
	@Type(() => Number)
	@IsPositive()
	page?: number = 1

	@IsOptional()
	@Type(() => Number)
	@IsPositive()
	limit?: number = 10

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	sortBy?: string
}

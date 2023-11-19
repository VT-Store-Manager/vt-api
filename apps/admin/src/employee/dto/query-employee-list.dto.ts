import { Type } from 'class-transformer'
import { IsOptional, IsPositive, IsString, IsNotEmpty } from 'class-validator'

export class QueryEmployeeListDTO {
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

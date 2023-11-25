import { IsOptional, IsString, IsNotEmpty } from 'class-validator'

export class QueryPartnerListDTO {
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	sortBy?: string
}

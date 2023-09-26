import { keyCodePattern } from '@app/common'
import { IsMongoId, IsOptional, IsString, Matches } from 'class-validator'

export class GetOrderDetailQueryDTO {
	@IsOptional()
	@IsMongoId()
	id?: string

	@IsOptional()
	@IsString()
	@Matches(keyCodePattern)
	code?: string
}

import { Type } from 'class-transformer'
import { IsNumber, IsOptional } from 'class-validator'

export class GetPendingOrderListDTO {
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	lat?: number

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	lng?: number
}

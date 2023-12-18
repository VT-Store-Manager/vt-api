import { Type } from 'class-transformer'
import { IsOptional, IsPositive } from 'class-validator'

export class RequestWithdrawDTO {
	@IsOptional()
	@IsPositive()
	@Type(() => Number)
	amount?: number = 100000
}

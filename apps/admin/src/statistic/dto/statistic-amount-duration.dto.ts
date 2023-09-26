import { Type } from 'class-transformer'
import { IsPositive, IsOptional } from 'class-validator'

export class StatisticAmountDurationDTO {
	@Type(() => Number)
	@IsPositive()
	@IsOptional()
	duration = 30
}

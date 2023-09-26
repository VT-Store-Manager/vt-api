import { RangeTimeType } from '@app/common'
import { Type } from 'class-transformer'
import { IsEnum, IsOptional, IsPositive } from 'class-validator'

export class StatisticRangeTime {
	@IsEnum(RangeTimeType)
	rangeType: RangeTimeType = RangeTimeType.MONTH

	@IsOptional()
	@Type(() => Number)
	@IsPositive()
	startRange?: string

	@IsOptional()
	@Type(() => Number)
	@IsPositive()
	endRange?: string
}

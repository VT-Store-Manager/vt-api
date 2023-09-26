import { RangeTimeType } from '@app/common'
import { IsEnum, IsOptional } from 'class-validator'

export class StatisticSaleQueryDTO {
	@IsOptional()
	@IsEnum(RangeTimeType)
	timePeriod?: RangeTimeType
}

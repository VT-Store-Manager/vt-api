import { RangeTimeType } from '@app/common'
import { IsEnum, IsOptional } from 'class-validator'

export class StatisticSaleVolumeDTO {
	@IsOptional()
	@IsEnum(RangeTimeType)
	timePeriod?: RangeTimeType
}

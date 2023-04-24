import { Type } from 'class-transformer'
import {
	IsArray,
	IsMongoId,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString,
	Min,
	MinLength,
	Validate,
	ValidateNested,
} from 'class-validator'

import { FinishTimeRule } from '@/common/rules/finish-time.rule'
import { PromotionLimitation } from '@/schemas/promotion-limitation.schema'
import { Promotion } from '@/schemas/promotion.schema'
import { IntersectionType, PartialType, PickType } from '@nestjs/swagger'
import { ApiPropertyFile } from '@/common/decorators/file-swagger.decorator'

export class CreatePromotionDTO extends IntersectionType(
	PickType(Promotion, ['title', 'voucher', 'cost'] as const),
	PartialType(
		PickType(Promotion, [
			'description',
			'startTime',
			'finishTime',
			'possibleTarget',
			'limitation',
		] as const)
	)
) {
	@IsString()
	@MinLength(3)
	title: string

	@IsMongoId()
	voucher: string

	@IsNumber()
	@Type(() => Number)
	@Min(0)
	cost: number

	@IsOptional()
	@ApiPropertyFile()
	image?: any

	@IsOptional()
	@IsString()
	description?: string = ''

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(new Date(2023, 0, 1).getTime())
	startTime?: number = Date.now()

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Validate(FinishTimeRule)
	finishTime?: number

	@IsArray()
	@IsMongoId({ each: true })
	possibleTarget?: string[] = []

	@IsOptional()
	@IsArray()
	@Type(() => PromotionLimitationDTO)
	@ValidateNested({ each: true })
	limitation?: PromotionLimitationDTO[] = []
}

export class PromotionLimitationDTO extends PromotionLimitation {
	@IsMongoId({ each: true })
	target: string[]

	@IsOptional()
	@Type(() => Number)
	@IsPositive()
	maxExchange?: number
}

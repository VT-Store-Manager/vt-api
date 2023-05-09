import { Type } from 'class-transformer'
import {
	IsArray,
	IsBoolean,
	IsMongoId,
	IsNumber,
	IsOptional,
	IsString,
	Min,
	MinLength,
	Validate,
} from 'class-validator'

import { FinishTimeRule } from '@/common/rules/finish-time.rule'
import { Promotion } from '@schema/promotion.schema'
import { IntersectionType, PartialType, PickType } from '@nestjs/swagger'
import { ApiPropertyFile } from '@/common/decorators/file-swagger.decorator'

export class CreatePromotionDTO extends IntersectionType(
	PickType(Promotion, ['category', 'title', 'voucher', 'cost'] as const),
	PartialType(
		PickType(Promotion, [
			'description',
			'startTime',
			'finishTime',
			'possibleTarget',
			'isFeatured',
		] as const)
	)
) {
	@IsMongoId()
	category: string

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
	@IsMongoId()
	partner: string

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
	finishTime: number

	@IsArray()
	@IsMongoId({ each: true })
	possibleTarget?: string[] = []

	@IsOptional()
	@IsBoolean()
	@Type(() => Boolean)
	isFeatured?: boolean = false
}

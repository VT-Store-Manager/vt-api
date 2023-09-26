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

import { ApiPropertyFile, FinishTimeRule } from '@app/common'
import { Promotion } from '@app/database'
import { IntersectionType, PartialType, PickType } from '@nestjs/swagger'

export class CreatePromotionDTO extends IntersectionType(
	PickType(Promotion, ['category', 'voucher', 'cost'] as const),
	PartialType(
		PickType(Promotion, [
			'title',
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

	@IsMongoId()
	voucher: string

	@IsNumber()
	@Type(() => Number)
	@Min(0)
	cost: number

	@IsOptional()
	@IsString()
	@MinLength(3)
	title?: string = null

	@IsOptional()
	@IsString()
	description?: string = ''

	@IsOptional()
	@IsMongoId()
	partner?: string

	@IsOptional()
	@ApiPropertyFile()
	image?: any

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
	@IsBoolean()
	@Type(() => Boolean)
	isFeatured?: boolean = false
}

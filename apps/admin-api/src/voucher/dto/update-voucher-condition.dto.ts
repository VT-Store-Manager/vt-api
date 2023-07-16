import { Type } from 'class-transformer'
import {
	IsArray,
	IsBoolean,
	IsEnum,
	IsMongoId,
	IsNumber,
	IsOptional,
	IsString,
	Matches,
	Min,
	ValidateNested,
} from 'class-validator'

import { optionItemKeyLength, ShippingMethod } from '@app/common'
import { ConditionInclusion, VoucherCondition } from '@app/database'
import { PartialType } from '@nestjs/swagger'

export class UpdateVoucherConditionDTO extends PartialType(VoucherCondition) {
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(-1)
	minQuantity?: number

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(-1)
	minPrice?: number

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@IsEnum(ShippingMethod)
	shippingMethod?: ShippingMethod

	@IsOptional()
	@Type(() => ConditionInclusionDTO)
	@ValidateNested({ each: true })
	@IsArray()
	inclusion?: ConditionInclusionDTO[]
}

export class ConditionInclusionDTO extends ConditionInclusion {
	@IsOptional()
	@IsMongoId({ each: true })
	ids?: string[]

	@IsOptional()
	@IsString({ each: true })
	@Matches(
		new RegExp(
			`^[a-z]{${optionItemKeyLength}}((&|(\\|))[a-z]{${optionItemKeyLength}}){0,}$`
		),
		{ each: true }
	)
	options?: string[] = []

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	quantity?: number

	@IsBoolean()
	@Type(() => Boolean)
	required: boolean
}

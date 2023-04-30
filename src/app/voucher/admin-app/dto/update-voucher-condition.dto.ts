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

import { ShippingMethod } from '@/common/constants'
import { optionItemKeyLength } from '@/common/helpers/key.helper'
import {
	ConditionInclusion,
	VoucherCondition,
} from '@/schemas/voucher-condition.schema'
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
	@IsMongoId()
	id?: string

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

import { Type } from 'class-transformer'
import {
	IsArray,
	IsBoolean,
	IsMongoId,
	IsNumber,
	IsOptional,
	IsString,
	Matches,
	Min,
	ValidateNested,
} from 'class-validator'

import { optionItemKeyLength } from '@/common/helpers/key.helper'
import { OfferTarget, VoucherDiscount } from '@/schemas/voucher-discount.schema'
import { PartialType } from '@nestjs/swagger'

export class UpdateVoucherDiscountDTO extends PartialType(VoucherDiscount) {
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(-1)
	maxDiscount?: number

	@IsOptional()
	@Type(() => Boolean)
	@IsBoolean()
	freeship?: boolean

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(-1)
	percentage?: number

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(-1)
	decrease?: number

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(-1)
	salePrice?: number

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(-1)
	offerAny?: number

	@Type(() => OfferTargetDTO)
	@IsArray()
	@ValidateNested({ each: true })
	offerTarget?: OfferTargetDTO[]
}

export class OfferTargetDTO extends OfferTarget {
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
	options?: string[]

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	quantity?: number

	@Type(() => Number)
	@IsNumber()
	@Min(0)
	salePrice: number
}

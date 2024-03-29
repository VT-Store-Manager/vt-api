import { Type } from 'class-transformer'
import {
	IsArray,
	IsBoolean,
	IsMongoId,
	IsNumber,
	IsOptional,
	IsString,
	Matches,
	Max,
	Min,
	ValidateNested,
} from 'class-validator'

import { optionItemKeyLength } from '@app/common'
import { OfferTarget, VoucherDiscount } from '@app/database'
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
	freeShip?: boolean

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(-1)
	@Max(100)
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
	@IsString()
	@Matches(/[1-9]\+[1-9]/)
	buyAndGet?: string

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

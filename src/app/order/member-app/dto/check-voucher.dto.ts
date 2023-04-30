import { Type } from 'class-transformer'
import {
	ArrayMinSize,
	IsArray,
	IsEnum,
	IsMongoId,
	IsNumber,
	IsPositive,
	IsString,
	Matches,
	ValidateNested,
} from 'class-validator'

import { ShippingMethod } from '@/common/constants'

export class CheckVoucherDTO {
	@IsMongoId()
	voucherId: string

	@IsNumber()
	@Type(() => Number)
	@IsEnum(ShippingMethod)
	categoryId: ShippingMethod

	@IsArray()
	@ArrayMinSize(1)
	@Type(() => ShortProductInCartDTO)
	@ValidateNested({ each: true })
	products: ShortProductInCartDTO[]
}

export class ShortProductInCartDTO {
	@IsMongoId()
	id: string

	@IsString({ each: true })
	@Matches(/[a-z]{6}/, { each: true })
	options: string[] = []

	@IsPositive()
	amount: number
}

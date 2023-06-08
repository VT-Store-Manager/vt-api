import { Type } from 'class-transformer'
import {
	ArrayMinSize,
	IsArray,
	IsMongoId,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString,
	Matches,
	Min,
	ValidateNested,
} from 'class-validator'

import { optionItemKeyLength } from '@/common/helpers/key.helper'
import { CartProduct, CartTemplate } from '@schema/cart-template.schema'
import { PickType } from '@nestjs/swagger'

export class CreateCartTemplateDTO extends PickType(CartTemplate, [
	'name',
	'index',
	'products',
] as const) {
	@IsString()
	@IsNotEmpty()
	name: string

	@IsOptional()
	@IsNumber()
	@Min(0)
	index?: number

	@IsArray()
	@ArrayMinSize(1)
	@Type(() => CartProductDTO)
	@ValidateNested({ each: true })
	products: CartProductDTO[]
}

export class CartProductDTO extends PickType(CartProduct, [
	'id',
	'options',
	'amount',
] as const) {
	@IsMongoId()
	id: string

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	@Matches(new RegExp(`^[a-z]{${optionItemKeyLength}}$`), { each: true })
	options?: string[] = []

	@IsOptional()
	@IsPositive()
	amount?: number = 1
}

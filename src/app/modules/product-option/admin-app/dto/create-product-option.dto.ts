import { Type } from 'class-transformer'
import {
	ArrayMaxSize,
	ArrayMinSize,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	Min,
	Validate,
	ValidateIf,
	ValidateNested,
} from 'class-validator'

import { ObjectIdRule } from '@/common/rules/object-id.rule'
import { OptionRangeRule } from '@/common/rules/option-range.rule'
import { ProductOptionItem } from '@schema/product-option-item.schema'
import { ProductOption } from '@schema/product-option.schema'
import { IntersectionType, PartialType, PickType } from '@nestjs/swagger'

export class CreateProductOptionDTO extends IntersectionType(
	PartialType(PickType(ProductOption, ['name', 'parent'] as const)),
	PickType(ProductOption, ['range'] as const)
) {
	@IsString()
	@IsNotEmpty()
	@IsOptional()
	@Validate(ObjectIdRule)
	parent?: string

	@ValidateIf(o => !o.parent)
	@IsString()
	@IsNotEmpty()
	name?: string

	@IsNumber({}, { each: true })
	@Min(0, { each: true })
	@ArrayMaxSize(2)
	@ArrayMinSize(2)
	@Validate(OptionRangeRule)
	range: number[]

	@ValidateIf(o => !!o.parent)
	@ValidateNested({ each: true })
	@Type(() => ChildProductOptionItemInput)
	@ArrayMinSize(1)
	childItems: ChildProductOptionItemInput[]

	@ValidateIf(o => !o.parent)
	@ValidateNested({ each: true })
	@Type(() => NewProductOptionItemInput)
	@ArrayMinSize(1)
	newItems: NewProductOptionItemInput[]
}

class ChildProductOptionItemInput extends IntersectionType(
	PickType(ProductOptionItem, ['key'] as const),
	PartialType(PickType(ProductOptionItem, ['cost'] as const))
) {
	@IsString()
	@IsNotEmpty()
	key: string

	@IsNumber()
	@Min(0)
	@IsOptional()
	cost?: number
}

class NewProductOptionItemInput extends PickType(ProductOptionItem, [
	'name',
	'cost',
] as const) {
	@IsString()
	@IsNotEmpty()
	name: string

	@IsNumber()
	@Min(0)
	cost: number
}

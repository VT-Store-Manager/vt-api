import { Type } from 'class-transformer'
import {
	ArrayMaxSize,
	ArrayMinSize,
	IsBoolean,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	Min,
	Validate,
	ValidateIf,
	ValidateNested,
} from 'class-validator'

import { ObjectIdRule, OptionRangeRule } from '@app/common'
import { ProductOption, ProductOptionItem } from '@app/database'
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
	PartialType(PickType(ProductOptionItem, ['cost', 'isDefault'] as const))
) {
	@IsString()
	@IsNotEmpty()
	key: string

	@IsOptional()
	@IsNumber()
	@Min(0)
	cost?: number

	@IsOptional()
	@Type(() => Boolean)
	@IsBoolean()
	isDefault?: boolean
}

class NewProductOptionItemInput extends IntersectionType(
	PickType(ProductOptionItem, ['name', 'cost'] as const),
	PartialType(PickType(ProductOptionItem, ['isDefault'] as const))
) {
	@IsString()
	@IsNotEmpty()
	name: string

	@IsNumber()
	@Min(0)
	cost: number

	@IsOptional()
	@Type(() => Boolean)
	@IsBoolean()
	isDefault?: boolean
}

import { Type } from 'class-transformer'
import {
	ArrayMaxSize,
	ArrayMinSize,
	IsArray,
	IsBoolean,
	IsIn,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	Matches,
	Min,
	Validate,
	ValidateIf,
	ValidateNested,
} from 'class-validator'

import { OptionRangeRule } from '@/common/rules/option-range.rule'

export class UpdateProductOptionDTO {
	@IsBoolean()
	isParentOption: boolean

	@ValidateIf((o: UpdateProductOptionDTO) => o.isParentOption)
	@IsString()
	@IsNotEmpty()
	@IsOptional()
	name?: string

	@IsOptional()
	@IsNumber({}, { each: true })
	@Min(0, { each: true })
	@ArrayMaxSize(2)
	@ArrayMinSize(2)
	@Validate(OptionRangeRule)
	range?: number[]

	@ValidateIf((o: UpdateProductOptionDTO) => o.isParentOption)
	@IsArray()
	@Type(() => ParentOptionItems)
	@ValidateNested({ each: true })
	parentItems?: ParentOptionItems[]

	@ValidateIf((o: UpdateProductOptionDTO) => !o.isParentOption)
	@IsArray()
	@Type(() => ChildOptionItems)
	@ValidateNested({ each: true })
	childrenItems?: ChildOptionItems[]
}

export class ParentOptionItems {
	@IsString()
	@IsIn(['add', 'update', 'delete'])
	action: 'add' | 'update' | 'delete'

	@IsBoolean()
	@IsOptional()
	changeChildren: boolean

	@ValidateIf((o: ParentOptionItems) => o.action !== 'delete')
	@IsString()
	@IsNotEmpty()
	name?: string

	@ValidateIf((o: ParentOptionItems) => o.action !== 'delete')
	@IsNumber()
	@Min(0)
	@Type(() => Number)
	cost?: number

	@ValidateIf((o: ParentOptionItems) => o.action === 'update')
	@IsBoolean()
	disabled?: boolean

	@IsOptional()
	@Type(() => Boolean)
	@IsBoolean()
	isDefault?: boolean

	@ValidateIf((o: ParentOptionItems) => o.action !== 'add')
	@IsString()
	@Matches(/^[a-z]{6}(-[a-z]{6}){0,}$/)
	key?: string
}

export class ChildOptionItems {
	@IsString()
	@IsIn(['add', 'update', 'delete'])
	action: 'add' | 'update' | 'delete'

	@IsString()
	@Matches(/^[a-z]{6}(-[a-z]{6}){0,}$/)
	parentKey?: string

	@ValidateIf((o: ParentOptionItems) => o.action !== 'delete')
	@IsNumber()
	@Min(0)
	@Type(() => Number)
	cost?: number

	@ValidateIf((o: ParentOptionItems) => o.action === 'update')
	@IsBoolean()
	disabled?: boolean

	@IsOptional()
	@Type(() => Boolean)
	@IsBoolean()
	isDefault?: boolean
}

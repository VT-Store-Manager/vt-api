import { Type } from 'class-transformer'
import {
	IsArray,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	Min,
	Validate,
} from 'class-validator'

import { ApiPropertyMultiFiles, ObjectIdRule } from '@app/common'
import { Product } from '@app/database'
import { IntersectionType, PartialType, PickType } from '@nestjs/swagger'

export class CreateProductDTO extends IntersectionType(
	PickType(Product, [
		'name',
		'images',
		'originalPrice',
		'category',
		'options',
	] as const),
	PartialType(PickType(Product, ['description'] as const))
) {
	@IsString()
	@IsNotEmpty()
	name: string

	@ApiPropertyMultiFiles()
	images: any[]

	@Type(() => Number)
	@IsNumber()
	@Min(0)
	originalPrice: number

	@IsString()
	@IsNotEmpty()
	@Validate(ObjectIdRule)
	category: string

	@IsString()
	description?: string

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	@Validate(ObjectIdRule, { each: true })
	@IsNotEmpty({ each: true })
	@Type(() => Array<string>)
	options: Array<string> = []
}

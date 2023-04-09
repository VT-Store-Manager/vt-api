import { Type } from 'class-transformer'
import {
	IsHexColor,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	Min,
} from 'class-validator'

import { ApiPropertyFile } from '@/common/decorators/file-swagger.decorator'
import { Rank } from '@/schemas/rank.schema'
import { IntersectionType, PartialType, PickType } from '@nestjs/swagger'

export class CreateRankDTO extends IntersectionType(
	PickType(Rank, ['name'] as const),
	PartialType(PickType(Rank, ['minPoint', 'coefficientPoint'] as const))
) {
	@ApiPropertyFile()
	icon: string

	@ApiPropertyFile()
	background: string

	@IsString()
	@IsNotEmpty()
	name: string

	@IsHexColor()
	color: string

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	minPoint?: number

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(1)
	coefficientPoint? = 1
}

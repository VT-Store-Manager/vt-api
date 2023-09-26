import { IsNotEmpty, IsString, MinLength } from 'class-validator'

import { ApiPropertyFile } from '@app/common'
import { PromotionCategory } from '@app/database'
import { PickType } from '@nestjs/swagger'

export class CreatePromotionCategoryDTO extends PickType(PromotionCategory, [
	'name',
] as const) {
	@IsString()
	@IsNotEmpty()
	@MinLength(3)
	name: string

	@ApiPropertyFile()
	image: any
}

import { IsNotEmpty, IsString, MinLength } from 'class-validator'

import { ApiPropertyFile } from '@/common/decorators/file-swagger.decorator'
import { PromotionCategory } from '@schema/promotion-category.schema'
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

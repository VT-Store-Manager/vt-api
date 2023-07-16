import { IsString, MaxLength, MinLength } from 'class-validator'

import { ApiPropertyFile } from '@app/common'

export class CreateProductCategoryDTO {
	@ApiPropertyFile()
	image?: any

	@IsString()
	@MinLength(3)
	@MaxLength(20)
	name: string
}

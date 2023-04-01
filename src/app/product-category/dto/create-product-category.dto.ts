import { ApiPropertyFile } from '@/common/decorators/file-swagger.decorator'
import { IsString, MaxLength, MinLength } from 'class-validator'

export class CreateProductCategoryDTO {
	@ApiPropertyFile()
	image?: any

	@IsString()
	@MinLength(3)
	@MaxLength(20)
	name: string
}

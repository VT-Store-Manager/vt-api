import {
	IsArray,
	IsMongoId,
	IsNotEmpty,
	IsOptional,
	IsString,
} from 'class-validator'

import { ApiPropertyFile } from '@/common/decorators/file-swagger.decorator'

export class CreateNewsDTO {
	@IsString()
	@IsNotEmpty()
	name: string

	@ApiPropertyFile()
	image: any

	@IsString()
	content: string

	@IsOptional()
	@IsArray()
	@IsMongoId({ each: true })
	tags?: string[] = []
}

import {
	IsArray,
	IsMongoId,
	IsNotEmpty,
	IsOptional,
	IsString,
} from 'class-validator'

import { ApiPropertyFile } from '@app/common'

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

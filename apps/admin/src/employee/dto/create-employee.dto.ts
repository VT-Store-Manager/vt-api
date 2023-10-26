import {
	IsEnum,
	IsMongoId,
	IsNumber,
	IsPhoneNumber,
	IsString,
	Min,
	MinLength,
} from 'class-validator'

import { ApiPropertyFile, Gender } from '@app/common'

export class CreateEmployeeDTO {
	@IsMongoId()
	store: string

	@IsPhoneNumber()
	phone: string

	@IsString()
	@MinLength(3)
	name: string

	@ApiPropertyFile()
	avatar?: any

	@IsEnum(Gender)
	gender: Gender

	@IsNumber()
	@Min(0)
	dob: number
}

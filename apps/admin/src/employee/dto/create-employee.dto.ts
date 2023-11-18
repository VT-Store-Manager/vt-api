import {
	IsDateString,
	IsEnum,
	IsMongoId,
	IsString,
	Matches,
	MinLength,
} from 'class-validator'

import { ApiPropertyFile, Gender, vnPhoneNumberPattern } from '@app/common'
import { Type } from 'class-transformer'

export class CreateEmployeeDTO {
	@IsMongoId()
	store: string

	@IsString()
	@Matches(vnPhoneNumberPattern)
	phone: string

	@IsString()
	@MinLength(3)
	name: string

	@ApiPropertyFile()
	avatar?: any

	@IsEnum(Gender)
	@Type(() => Number)
	gender: Gender

	@IsDateString()
	dob: Date
}

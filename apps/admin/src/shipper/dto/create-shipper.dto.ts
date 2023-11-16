import { ApiPropertyFile, Gender, vnPhoneNumberPattern } from '@app/common'
import { Type } from 'class-transformer'
import {
	IsDateString,
	IsEnum,
	IsString,
	Matches,
	MinLength,
} from 'class-validator'

export class CreateShipperDTO {
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
	gender: Gender = Gender.MALE

	@IsDateString()
	dob: Date
}

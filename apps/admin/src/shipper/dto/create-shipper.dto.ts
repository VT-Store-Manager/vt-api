import { ApiPropertyFile, Gender, vnPhoneNumberPattern } from '@app/common'
import { Type } from 'class-transformer'
import {
	IsEnum,
	IsNumber,
	IsString,
	Matches,
	Min,
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

	@IsNumber()
	@Type(() => Number)
	@Min(0)
	dob: number
}

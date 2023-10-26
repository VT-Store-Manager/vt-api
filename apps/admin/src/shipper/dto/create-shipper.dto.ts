import { ApiPropertyFile, Gender } from '@app/common'
import {
	IsEnum,
	IsNumber,
	IsPhoneNumber,
	IsString,
	Min,
	MinLength,
} from 'class-validator'

export class CreateShipperDTO {
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

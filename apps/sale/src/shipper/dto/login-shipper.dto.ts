import {
	validateAndTransformPhone,
	vnPhoneNumberPattern,
} from '@/libs/common/src'
import { Transform } from 'class-transformer'
import { IsString, Matches } from 'class-validator'

export class LoginDTO {
	@IsString()
	@Matches(vnPhoneNumberPattern)
	@Transform(({ value }) => validateAndTransformPhone(value))
	phone: string
}

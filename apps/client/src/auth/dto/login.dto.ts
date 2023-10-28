import { Transform } from 'class-transformer'
import { IsString, Matches } from 'class-validator'

import {
	validateAndTransformPhone,
	vnPhoneNumberPattern,
} from '@/libs/common/src'
import { ApiProperty } from '@nestjs/swagger'

export class LoginDTO {
	@IsString()
	@Matches(vnPhoneNumberPattern)
	@Transform(({ value }) => validateAndTransformPhone(value))
	@ApiProperty({ description: 'Phone number of account' })
	phone: string
}

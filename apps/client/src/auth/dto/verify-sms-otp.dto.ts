import { Transform } from 'class-transformer'
import { IsNumberString, IsString, Matches } from 'class-validator'

import {
	validateAndTransformPhone,
	vnPhoneNumberPattern,
} from '@/libs/common/src'
import { ApiProperty } from '@nestjs/swagger'

export class VerifySmsOtpDTO {
	@IsString()
	@Matches(vnPhoneNumberPattern)
	@Transform(({ value }) => validateAndTransformPhone(value))
	@ApiProperty({
		description:
			'Phone number of account - must have Country code (Vietnam code is +84)',
	})
	phone: string

	@IsNumberString()
	@Matches(/^[0-9]{6}$/)
	@ApiProperty({ description: 'OTP code - 6 digits' })
	code: string
}

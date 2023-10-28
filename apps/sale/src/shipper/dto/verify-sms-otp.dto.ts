import { IsNumberString, IsString, Matches } from 'class-validator'

import { ApiProperty } from '@nestjs/swagger'
import { vnPhoneNumberPattern } from '@app/common'

export class VerifySmsOtpDTO {
	@IsString()
	@Matches(vnPhoneNumberPattern)
	phone: string

	@IsNumberString()
	@Matches(/^[0-9]{6}$/)
	@ApiProperty({ description: 'OTP code - 6 digits' })
	code: string
}

import { ApiProperty } from '@nestjs/swagger'
import { IsNumberString, IsPhoneNumber, Matches } from 'class-validator'

export class VerifySmsOtpDTO {
	@IsPhoneNumber()
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

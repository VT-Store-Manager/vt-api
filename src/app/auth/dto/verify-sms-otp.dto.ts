import { IsNumberString, IsPhoneNumber, Matches } from 'class-validator'

export class VerifySmsOtpDto {
	@IsPhoneNumber()
	mobile: string

	@IsNumberString()
	@Matches(/^[0-9]{6}$/)
	code: string
}

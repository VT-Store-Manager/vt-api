import { vnPhoneNumberPattern } from '@/libs/common/src'
import { IsString, Matches } from 'class-validator'

export class LoginDTO {
	@IsString()
	@Matches(vnPhoneNumberPattern)
	phone: string
}

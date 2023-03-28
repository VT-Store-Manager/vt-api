import { IsPhoneNumber } from 'class-validator'

export class LoginDTO {
	@IsPhoneNumber()
	mobile: string
}

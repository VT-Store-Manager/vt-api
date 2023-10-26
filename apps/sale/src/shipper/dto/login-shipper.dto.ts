import { IsPhoneNumber } from 'class-validator'

export class LoginDTO {
	@IsPhoneNumber()
	phone: string
}

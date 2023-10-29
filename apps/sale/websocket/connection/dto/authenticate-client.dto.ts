import { IsJWT } from 'class-validator'

export class AuthenticateClientDTO {
	@IsJWT()
	token: string
}

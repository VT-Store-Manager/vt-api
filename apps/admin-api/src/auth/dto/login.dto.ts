import { IsString } from 'class-validator'

export class LoginAdminDTO {
	@IsString()
	username: string

	@IsString()
	password: string
}

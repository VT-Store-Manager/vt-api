import { adminPasswordPattern } from '@/libs/common/src'
import { IsString, Matches } from 'class-validator'

export class UpdatePasswordDTO {
	@IsString()
	oldPassword: string

	@IsString()
	@Matches(adminPasswordPattern)
	newPassword: string
}

import { IsString, Matches } from 'class-validator'

import { adminPasswordPattern } from '@app/common'

export class UpdateAccountAdminPasswordDTO {
	@IsString()
	oldPassword: string

	@IsString()
	@Matches(adminPasswordPattern)
	newPassword: string
}

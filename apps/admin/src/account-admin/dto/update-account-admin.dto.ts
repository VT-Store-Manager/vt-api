import { IsOptional, IsString } from 'class-validator'

export class UpdateAccountAdminDTO {
	@IsOptional()
	@IsString()
	username?: string

	@IsOptional()
	@IsString()
	name?: string
}

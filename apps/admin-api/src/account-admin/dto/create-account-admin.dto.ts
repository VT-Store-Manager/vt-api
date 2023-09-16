import { IsMongoId, IsOptional, IsString, Matches } from 'class-validator'

export class CreateAccountAdminDTO {
	@IsString()
	@Matches(/[a-zA-Z0-9_.-]{3,}/)
	username: string

	@IsString()
	name: string

	@IsMongoId()
	role?: string

	@IsOptional()
	@IsMongoId({ each: true })
	stores?: string[] = []
}

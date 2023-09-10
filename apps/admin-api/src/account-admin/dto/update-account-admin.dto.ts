import { IsMongoId, IsOptional, IsString, Matches } from 'class-validator'

export class UpdateAccountAdminDTO {
	@IsMongoId()
	id: string

	@IsOptional()
	@IsString()
	username?: string

	@IsOptional()
	@IsString()
	@Matches(
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~!@#$%^&*?_,.])[A-Za-z\d~!@#$%^&*?_,.]{8,}$/
	)
	password?: string

	@IsOptional()
	@IsMongoId({ each: true })
	role?: string[]

	@IsOptional()
	@IsMongoId({ each: true })
	stores?: string[]
}

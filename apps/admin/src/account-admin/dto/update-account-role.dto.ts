import { IsMongoId, IsOptional } from 'class-validator'

export class UpdateAccountRoleDTO {
	@IsMongoId({ each: true })
	roles: string[]

	@IsMongoId({ each: true })
	@IsOptional()
	stores?: string[]
}

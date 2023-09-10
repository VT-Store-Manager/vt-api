import { Type } from 'class-transformer'
import {
	IsMongoId,
	IsOptional,
	IsString,
	ValidateNested,
} from 'class-validator'

export class PermissionSelectedItem {
	@IsMongoId()
	id: string

	@IsOptional()
	@IsMongoId({ each: true })
	scopes?: string[] = []
}

export class CreateAccountAdminRoleDTO {
	@IsString()
	name: string

	@IsOptional()
	@Type(() => PermissionSelectedItem)
	@ValidateNested({ each: true })
	permissions?: PermissionSelectedItem[] = []
}

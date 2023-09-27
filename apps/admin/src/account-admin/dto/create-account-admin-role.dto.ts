import { AdminFeature, Actions } from '@/apps/admin/constants'
import { Type } from 'class-transformer'
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator'

export class PermissionSelectedItem {
	@IsEnum(AdminFeature)
	featureName: AdminFeature

	@IsEnum(Actions, { each: true })
	scopes: Actions[]
}

export class CreateAccountAdminRoleDTO {
	@IsString()
	name: string

	@IsOptional()
	@Type(() => PermissionSelectedItem)
	@ValidateNested({ each: true })
	permissions?: PermissionSelectedItem[] = []
}

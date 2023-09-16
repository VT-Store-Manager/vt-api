import {
	AdminFeature,
	AdminFeaturePermission,
} from '@/apps/admin-api/constants'
import { Type } from 'class-transformer'
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator'

export class PermissionSelectedItem {
	@IsEnum(AdminFeature)
	featureName: AdminFeature

	@IsEnum(AdminFeaturePermission, { each: true })
	permissions: AdminFeaturePermission[]
}

export class CreateAccountAdminRoleDTO {
	@IsString()
	name: string

	@IsOptional()
	@Type(() => PermissionSelectedItem)
	@ValidateNested({ each: true })
	permissions?: PermissionSelectedItem[] = []
}

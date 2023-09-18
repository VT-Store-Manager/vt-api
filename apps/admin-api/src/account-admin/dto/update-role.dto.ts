import { Type } from 'class-transformer'
import {
	ArrayMinSize,
	IsArray,
	IsMongoId,
	IsString,
	ValidateNested,
} from 'class-validator'

export class UpdateRoleDTO {
	@IsMongoId()
	id: string

	@IsString()
	name: string

	@IsArray()
	@ArrayMinSize(1)
	@Type(() => RolePermissionItemDTO)
	@ValidateNested({ each: true })
	permissions: RolePermissionItemDTO[]
}

export class RolePermissionItemDTO {
	@IsString()
	featureName: string

	@IsString({ each: true })
	scopes: string[]
}

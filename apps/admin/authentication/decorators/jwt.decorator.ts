import { Role } from '@app/common'

import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'

import {
	JwtAccessAdminGuard,
	JwtAccessAdminOptionalGuard,
} from '../guards/jwt-access.guard'
import { JwtRefreshAdminGuard } from '../guards/jwt-refresh.guard'

export const ROLES_KEY = 'roles'
export const JWT_OPTIONAL = 'is_jwt_optional'

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles)

export const JwtOptional = () => SetMetadata(JWT_OPTIONAL, true)

export function JwtAccess() {
	return applyDecorators(ApiBearerAuth(), UseGuards(JwtAccessAdminGuard))
}

export function JwtAccessOptional() {
	return applyDecorators(
		SetMetadata(JWT_OPTIONAL, true),
		ApiBearerAuth(),
		UseGuards(JwtAccessAdminOptionalGuard)
	)
}

export function JwtRefresh() {
	return applyDecorators(ApiBearerAuth(), UseGuards(JwtRefreshAdminGuard))
}

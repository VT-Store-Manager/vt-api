import { Role } from '@app/common'

import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'

import {
	JwtAccessGuard,
	JwtAccessOptionalGuard,
} from '../guards/jwt-access.guard'
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard'
import { RolesGuard, WsAuthExpireCheckGuard } from '@app/authentication'
import { WsRoleGuard } from '../guards/ws-role.guard'

export const ROLES_KEY = 'roles'
export const JWT_OPTIONAL = 'is_jwt_optional'

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles)

export const JwtOptional = () => SetMetadata(JWT_OPTIONAL, true)

export function JwtAccess(...roles: Role[]) {
	return applyDecorators(
		ApiBearerAuth(),
		UseGuards(JwtAccessGuard),
		...(roles.length > 0
			? [SetMetadata(ROLES_KEY, roles), UseGuards(RolesGuard)]
			: [])
	)
}

export function JwtAccessOptional(...roles: Role[]) {
	return applyDecorators(
		SetMetadata(JWT_OPTIONAL, true),
		ApiBearerAuth(),
		UseGuards(JwtAccessOptionalGuard),
		...(roles.length > 0
			? [SetMetadata(ROLES_KEY, roles), UseGuards(RolesGuard)]
			: [])
	)
}

export function JwtRefresh(...roles: Role[]) {
	return applyDecorators(
		ApiBearerAuth(),
		UseGuards(JwtRefreshGuard),
		...(roles.length > 0
			? [SetMetadata(ROLES_KEY, roles), UseGuards(RolesGuard)]
			: [])
	)
}

export function WsAuth(...roles: Role[]) {
	return applyDecorators(
		UseGuards(WsAuthExpireCheckGuard),
		...(roles.length > 0
			? [SetMetadata(ROLES_KEY, roles), UseGuards(WsRoleGuard)]
			: [])
	)
}

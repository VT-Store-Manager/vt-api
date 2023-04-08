import { Role } from '@/common/constants'
import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'

import { JwtAccessGuard } from '../guards/jwt-access.guard'
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard'
import { RolesGuard } from '../guards/roles.guard'

export const ROLES_KEY = 'roles'

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles)

export function JwtAccess(...roles: Role[]) {
	return applyDecorators(
		ApiBearerAuth(),
		UseGuards(JwtAccessGuard),
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

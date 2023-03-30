import { applyDecorators, UseGuards } from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'

import { JwtAccessGuard } from '../guards/jwt-access.guard'
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard'

export function JwtAccess() {
	return applyDecorators(ApiBearerAuth(), UseGuards(JwtAccessGuard))
}

export function JwtRefresh() {
	return applyDecorators(ApiBearerAuth(), UseGuards(JwtRefreshGuard))
}

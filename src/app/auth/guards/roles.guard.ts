import { Request } from 'express'

import { Role } from '@/common/constants'
import { TokenPayload } from '@/types/token.dto'
import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { ROLES_KEY } from '../decorators/jwt.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
			context.getHandler(),
			context.getClass(),
		])
		if (!requiredRoles) {
			return true
		}

		const { user } = context
			.switchToHttp()
			.getRequest<Request & { user: TokenPayload }>()

		return requiredRoles.some(role => {
			if (Array.isArray(user.role)) {
				return user.role.includes(role)
			}
			if (typeof user.role === 'string') {
				return user.role === role
			}
			throw new UnauthorizedException('Token role is invalid')
		})
	}
}

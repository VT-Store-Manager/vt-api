import {
	Injectable,
	CanActivate,
	ExecutionContext,
	ForbiddenException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Role } from '@app/common'
import { ROLES_KEY } from '../decorators/jwt.decorator'
import { Socket } from 'socket.io'
import { TokenPayload } from '@app/types'
import { AUTHENTICATION_KEY } from '@sale/config/constant'

@Injectable()
export class WsRoleGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
			context.getHandler(),
			context.getClass(),
		])

		if (!requiredRoles) {
			return true
		}

		const auth: TokenPayload = context.switchToWs().getClient<Socket>()[
			AUTHENTICATION_KEY
		]

		if (!auth.role) {
			throw new ForbiddenException()
		}

		return requiredRoles.some(role => {
			if (Array.isArray(auth.role)) {
				return auth.role.includes(role)
			}
			if (typeof auth.role === 'string') {
				return auth.role === role
			}
			throw new ForbiddenException()
		})
	}
}

import { Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtAccessAdminGuard extends AuthGuard('jwt-access-admin') {}

@Injectable()
export class JwtAccessAdminOptionalGuard extends AuthGuard('jwt-access-admin') {
	handleRequest<TokenPayload>(err: any, adminPayload: TokenPayload | false) {
		if (err) {
			throw new UnauthorizedException(err.message)
		}
		if (adminPayload) return adminPayload
		return null
	}
}

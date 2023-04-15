import { Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtAccessGuard extends AuthGuard('jwt-access') {}

@Injectable()
export class JwtAccessOptionalGuard extends AuthGuard('jwt-access') {
	handleRequest<TokenPayload>(err: any, user: TokenPayload | false) {
		if (err) {
			throw new UnauthorizedException(err.message)
		}
		if (user) return user
		return null
	}
}

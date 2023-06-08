import { ExtractJwt, Strategy } from 'passport-jwt'

import { Role } from '@/common/constants'
import { TokenPayload } from '@/types/token'
import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { AuthService as MemberAuthService } from '@/app/member/auth/auth.service'

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
	Strategy,
	'jwt-access'
) {
	constructor(
		private readonly configService: ConfigService,
		private readonly memberAuthService: MemberAuthService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get<string>('jwt.accessTokenSecret'),
		})
	}

	async validate(payload: TokenPayload) {
		if (payload.role === Role.MEMBER) {
			const validTime = await this.memberAuthService.getTokenValidTime(
				payload.sub
			)
			if (validTime.getTime() > payload.iat * 1000) {
				throw new ForbiddenException('Detected an abnormal action or data')
			}
			return payload
		} else {
			return payload
		}
	}
}

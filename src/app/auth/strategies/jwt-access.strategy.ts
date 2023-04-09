import { ExtractJwt, Strategy } from 'passport-jwt'

import { Role } from '@/common/constants'
import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'

import { AuthMemberService } from '../member-app/auth-member.service'
import { TokenPayload } from '@/types/token.jwt'

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
	Strategy,
	'jwt-access'
) {
	constructor(
		private readonly configService: ConfigService,
		private readonly authMemberService: AuthMemberService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get<string>('jwt.accessTokenSecret'),
		})
	}

	async validate(payload: TokenPayload) {
		if (payload.role === Role.MEMBER) {
			const validTime = await this.authMemberService.getTokenValidTime(
				payload.sub
			)
			if (validTime.getTime() > payload.iat * 1000) {
				throw new ForbiddenException('Detected an abnormal login')
			}
			return payload
		} else {
			return payload
		}
	}
}

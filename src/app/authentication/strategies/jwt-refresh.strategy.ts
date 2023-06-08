import { ExtractJwt, Strategy } from 'passport-jwt'

import { TokenPayload } from '@/types/token'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { TokenService } from '../services/token.service'
import { AuthService as MemberAuthService } from '@/app/member/auth/auth.service'

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
	Strategy,
	'jwt-refresh'
) {
	constructor(
		private readonly configService: ConfigService,
		private readonly tokenService: TokenService,
		private readonly memberAuthService: MemberAuthService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get<string>('jwt.refreshTokenSecret'),
		})
	}

	async validate(payload: TokenPayload) {
		const refreshToken = await this.tokenService.getRefreshToken(payload)
		try {
			await this.tokenService.check(refreshToken)
		} catch (error) {
			await this.memberAuthService.updateTokenValidTime(payload.sub)
			throw error
		}

		return payload
	}
}

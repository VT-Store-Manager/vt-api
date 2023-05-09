import { ExtractJwt, Strategy } from 'passport-jwt'

import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'

import { AuthMemberService } from '../member-app/auth-member.service'
import { TokenService } from '../services/token.service'
import { TokenPayload } from '@/types/token'

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
	Strategy,
	'jwt-refresh'
) {
	constructor(
		private readonly configService: ConfigService,
		private readonly tokenService: TokenService,
		private readonly authMemberService: AuthMemberService
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
			await this.authMemberService.updateTokenValidTime(payload.sub)
			throw error
		}

		return payload
	}
}

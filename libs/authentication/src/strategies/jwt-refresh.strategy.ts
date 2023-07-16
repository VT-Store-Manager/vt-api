import { ExtractJwt, Strategy } from 'passport-jwt'

import { TokenPayload } from '@app/types'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { TokenService } from '../services/token.service'
import { AuthService } from '../services/auth.service'

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
	Strategy,
	'jwt-refresh'
) {
	constructor(
		private readonly configService: ConfigService,
		private readonly tokenService: TokenService,
		private readonly authService: AuthService
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
			await this.authService.updateTokenValidTime(payload.sub)
			throw error
		}

		return payload
	}
}

import { ExtractJwt, Strategy } from 'passport-jwt'

import { TokenService } from '@app/authentication'
import { Role } from '@app/common'
import { AccountAdminPayload } from '@app/types'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'

import { AuthService } from '../../src/auth/auth.service'

@Injectable()
export class JwtRefreshAdminStrategy extends PassportStrategy(
	Strategy,
	'jwt-refresh-admin'
) {
	constructor(
		private readonly configService: ConfigService,
		private readonly tokenService: TokenService,
		private readonly authService: AuthService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get<string>('jwt.refreshTokenAdminSecret'),
		})
	}

	async validate(payload: AccountAdminPayload) {
		const refreshToken = await this.tokenService.getRefreshToken(payload, {
			type: Role.ADMIN,
		})
		try {
			await this.tokenService.check(refreshToken)
		} catch (error) {
			await this.authService.updateTokenValidTime(payload.sub)
			throw error
		}

		return payload
	}
}

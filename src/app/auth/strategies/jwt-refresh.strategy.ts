import { ExtractJwt, Strategy } from 'passport-jwt'

import { MongoSessionService } from '@/providers/mongo/session.service'
import { JwtTokenPayload, TokenSubject } from '@/types/token.jwt'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'

import { TokenService } from '../services/token.service'
import { AuthMemberService } from '../services/auth-member.service'

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
	Strategy,
	'jwt-refresh'
) {
	constructor(
		private readonly configService: ConfigService,
		private readonly tokenService: TokenService,
		private readonly mongoSessionService: MongoSessionService,
		private readonly authMemberService: AuthMemberService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get<string>('jwt.refreshTokenSecret'),
			jsonWebTokenOptions: { subject: TokenSubject.REFRESH },
		})
	}

	async validate(payload: JwtTokenPayload) {
		const refreshToken = await this.tokenService.getRefreshToken(payload)
		try {
			await this.tokenService.check(refreshToken)
		} catch (error) {
			await this.authMemberService.updateTokenValidTime(payload.uid)
			throw error
		}

		return payload
	}
}

import { ExtractJwt, Strategy } from 'passport-jwt'

import { UserRole } from '@/common/constants'
import { JwtTokenPayload, TokenSubject } from '@/types/token.jwt'
import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'

import { AuthMemberService } from '../services/auth-member.service'
import { TokenService } from '../services/token.service'
import { MongoSessionService } from '@/providers/mongo/session.service'

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
	Strategy,
	'jwt-access'
) {
	constructor(
		private readonly configService: ConfigService,
		private readonly tokenService: TokenService,
		private readonly authMemberService: AuthMemberService,
		private readonly mongoSessionService: MongoSessionService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get<string>('jwt.accessTokenSecret'),
			jsonWebTokenOptions: { subject: TokenSubject.ACCESS },
		})
	}

	async validate(payload: JwtTokenPayload) {
		if (payload.role === UserRole.MEMBER) {
			const validTime = await this.authMemberService.getTokenValidTime(
				payload.uid
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

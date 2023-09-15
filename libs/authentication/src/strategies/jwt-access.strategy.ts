import { ExtractJwt, Strategy } from 'passport-jwt'

import { Role } from '@app/common'
import { TokenPayload } from '@app/types'
import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { AuthService } from '../services/auth.service'

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
	Strategy,
	'jwt-access'
) {
	constructor(
		private readonly configService: ConfigService,
		private readonly authService: AuthService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get<string>('jwt.accessTokenSecret'),
		})
	}

	async validate(payload: TokenPayload) {
		if (payload.role === Role.MEMBER) {
			const validTime = await this.authService.getTokenValidTimeMember(
				payload.sub
			)
			if (validTime.getTime() > payload.iat * 1000) {
				throw new ForbiddenException('Detected an abnormal action or data')
			}
			return payload
		} else if (payload.role === Role.SALESPERSON) {
			if (!(await this.authService.checkStoreExist(payload.sub))) {
				throw new ForbiddenException('Store not found')
			}
			return payload
		} else if (payload.role.includes(Role.ADMIN)) {
			const validTime = await this.authService.getTokenValidTimeAdmin(
				payload.sub
			)
			if (validTime.getTime() > payload.iat * 1000) {
				throw new ForbiddenException('Detected an abnormal action or data')
			}
			return payload
		}
	}
}

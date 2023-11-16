import { ExtractJwt, Strategy } from 'passport-jwt'

import { AuthService } from '@admin/src/auth/auth.service'
import { AccountAdminPayload } from '@app/types'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'

@Injectable()
export class JwtAccessAdminStrategy extends PassportStrategy(
	Strategy,
	'jwt-access-admin'
) {
	constructor(
		private readonly configService: ConfigService,
		private readonly authService: AuthService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get<string>('jwt.accessTokenAdminSecret'),
		})
	}

	async validate(payload: AccountAdminPayload) {
		const admin = await this.authService.getAccountAdmin(payload.sub)

		if (admin.tokenValidTime.getTime() > payload.iat * 1000) {
			throw new UnauthorizedException('DANGER', {
				description: 'Detected an abnormal action or data',
			})
		}
		return { ...payload, adminData: admin }
	}
}

import { ExtractJwt, Strategy } from 'passport-jwt'

import { Role } from '@app/common'
import { TokenPayload } from '@app/types'
import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { InjectModel } from '@nestjs/mongoose'
import { Store, StoreDocument } from '@app/database'
import { Model } from 'mongoose'
import { Member, MemberDocument } from '@app/database'

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
	Strategy,
	'jwt-access'
) {
	constructor(
		@InjectModel(Store.name) private readonly storeModel: Model<StoreDocument>,
		@InjectModel(Member.name)
		private readonly memberModel: Model<MemberDocument>,
		private readonly configService: ConfigService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get<string>('jwt.accessTokenSecret'),
		})
	}

	async validate(payload: TokenPayload) {
		if (payload.role === Role.MEMBER) {
			const { tokenValidTime: validTime } = await this.memberModel
				.findById(payload.sub)
				.orFail(new ForbiddenException('User not found'))
				.select('tokenValidTime')
				.lean()
				.exec()
			// const validTime = await this.memberAuthService.getTokenValidTime(
			// 	payload.sub
			// )
			if (validTime.getTime() > payload.iat * 1000) {
				throw new ForbiddenException('Detected an abnormal action or data')
			}
			return payload
		} else if (payload.role === Role.SALESPERSON) {
			const store = await this.storeModel.count({ _id: payload.sub }).exec()
			if (!store) {
				throw new ForbiddenException('Store not found')
			}
			return payload
		} else {
			return payload
		}
	}
}

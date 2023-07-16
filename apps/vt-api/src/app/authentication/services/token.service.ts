import { ClientSession, Model, Types } from 'mongoose'

import { RefreshToken, RefreshTokenDocument } from '@app/database'
import { TokenPayload } from '@app/types'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService, JwtSignOptions } from '@nestjs/jwt'
import { InjectModel } from '@nestjs/mongoose'

@Injectable()
export class TokenService {
	constructor(
		@InjectModel(RefreshToken.name)
		private readonly refreshTokenModel: Model<RefreshTokenDocument>,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService
	) {}

	private resignToken(payload): string {
		return this.jwtService.sign(payload, {
			secret: this.configService.get<string>('jwt.refreshTokenSecret'),
		})
	}

	private async deleteAllRefreshToken(uid: string, session?: ClientSession) {
		const deleteResult = await this.refreshTokenModel
			.deleteMany({ uid: new Types.ObjectId(uid) }, session ? { session } : {})
			.exec()
		return deleteResult.deletedCount
	}

	private async disable(tokenValue: string, session?: ClientSession) {
		return await this.refreshTokenModel
			.updateOne(
				{ value: tokenValue },
				{ disabled: true },
				session ? { session } : {}
			)
			.exec()
	}

	async signToken(payload: TokenPayload, session?: ClientSession) {
		const { sub, exp: _exp, iat: _iat, ...payloadWithoutSubject } = payload
		const tokens = {
			accessToken: this.jwtService.sign(payloadWithoutSubject, {
				secret: this.configService.get<string>('jwt.accessTokenSecret'),
				expiresIn: this.configService.get<string>('jwt.accessTokenExpiresIn'),
				subject: sub,
			} as JwtSignOptions),
			refreshToken: this.jwtService.sign(payloadWithoutSubject, {
				secret: this.configService.get<string>('jwt.refreshTokenSecret'),
				expiresIn: this.configService.get<string>('jwt.refreshTokenExpiresIn'),
				subject: sub,
			} as JwtSignOptions),
		}

		await this.refreshTokenModel.create(
			[
				{
					uid: sub,
					value: tokens.refreshToken,
				},
			],
			session ? { session } : {}
		)
		return tokens
	}

	async getRefreshToken(payload: TokenPayload): Promise<RefreshToken> {
		return await this.refreshTokenModel
			.findOne({ value: this.resignToken(payload) })
			.orFail(new UnauthorizedException('Refresh token not found'))
			.lean()
			.exec()
	}

	async check(token: RefreshToken, session?: ClientSession) {
		if (token.disabled) {
			await this.deleteAllRefreshToken(token.uid.toString(), session)
			throw new UnauthorizedException('Refresh token is used')
		}
		const disableStatus = await this.disable(token.value, session)
		return disableStatus.modifiedCount > 0
	}
}

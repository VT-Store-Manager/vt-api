import { ClientSession, Model } from 'mongoose'

import { UserRole } from '@/common/constants'
import { Member } from '@/schemas/member.schema'
import {
	RefreshToken,
	RefreshTokenDocument,
} from '@/schemas/refresh-token.schema'
import {
	AccessTokenPayload,
	JwtTokenPayload,
	RefreshTokenPayload,
	TokenSubject,
} from '@/types/token.jwt'
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

	private async delete(tokenValue: string, session?: ClientSession) {
		return await this.refreshTokenModel
			.deleteOne({ value: tokenValue }, session ? { session } : {})
			.exec()
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

	async signMemberToken(member: Member, session?: ClientSession) {
		const accessTokenpPayload: AccessTokenPayload = {
			uid: member._id.toString(),
			role: UserRole.MEMBER,
			firstName: member.firstName,
			lastName: member.lastName,
		}

		const refreshTokenPayload: RefreshTokenPayload = {
			uid: member._id.toString(),
			role: UserRole.MEMBER,
		}

		const tokens = {
			access_token: this.jwtService.sign(accessTokenpPayload, {
				secret: this.configService.get<string>('jwt.accessTokenSecret'),
				expiresIn: this.configService.get<string>('jwt.accessTokenExpiresIn'),
				subject: TokenSubject.ACCESS,
			} as JwtSignOptions),
			refresh_token: this.jwtService.sign(refreshTokenPayload, {
				secret: this.configService.get<string>('jwt.refreshTokenSecret'),
				expiresIn: this.configService.get<string>('jwt.refreshTokenExpiresIn'),
				subject: TokenSubject.REFRESH,
			} as JwtSignOptions),
		}

		await this.refreshTokenModel.create(
			[
				{
					uid: member._id.toString(),
					value: tokens.refresh_token,
				},
			],
			session ? { session } : {}
		)
		return tokens
	}

	async deleteAllRefreshToken(uid: string, session?: ClientSession) {
		const deleteResult = await this.refreshTokenModel
			.deleteMany({ uid }, session ? { session } : {})
			.exec()
		return deleteResult.deletedCount
	}

	async getRefreshToken(payload: JwtTokenPayload): Promise<RefreshToken> {
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
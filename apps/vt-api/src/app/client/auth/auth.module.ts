import {
	JwtAccessStrategy,
	JwtRefreshStrategy,
	TokenService,
} from '@app/authentication'
import { MongoSessionService } from '@app/common'
import {
	Member,
	MemberData,
	MemberDataSchema,
	MemberRank,
	MemberRankSchema,
	MemberSchema,
	Rank,
	RankSchema,
	RefreshToken,
	RefreshTokenSchema,
	Store,
	StoreSchema,
} from '@app/database'
import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'

import { SmsService } from '../../authentication/services/sms.service'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Member.name, schema: MemberSchema },
			{ name: RefreshToken.name, schema: RefreshTokenSchema },
			{ name: MemberData.name, schema: MemberDataSchema },
			{ name: MemberRank.name, schema: MemberRankSchema },
			{ name: Rank.name, schema: RankSchema },
			{ name: Store.name, schema: StoreSchema },
		]),
		JwtModule.register({}),
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		SmsService,
		TokenService,
		MongoSessionService,
		JwtAccessStrategy,
		JwtRefreshStrategy,
	],
})
export class AuthModule {}

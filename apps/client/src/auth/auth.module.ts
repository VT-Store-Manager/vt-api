import {
	AuthService,
	JwtAccessStrategy,
	JwtRefreshStrategy,
	SmsService,
	TokenService,
} from '@app/authentication'
import {
	AccountAdmin,
	AccountAdminSchema,
	Member,
	MemberData,
	MemberDataSchema,
	MemberRank,
	MemberRankSchema,
	MemberSchema,
	MongoSessionService,
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

import { AuthController } from './auth.controller'
import { AuthService as ClientAuthService } from './auth.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Member.name, schema: MemberSchema },
			{ name: RefreshToken.name, schema: RefreshTokenSchema },
			{ name: MemberData.name, schema: MemberDataSchema },
			{ name: MemberRank.name, schema: MemberRankSchema },
			{ name: Rank.name, schema: RankSchema },
			{ name: Store.name, schema: StoreSchema },
			{ name: Store.name, schema: StoreSchema },
			{ name: AccountAdmin.name, schema: AccountAdminSchema },
		]),
		JwtModule.register({}),
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		ClientAuthService,
		SmsService,
		TokenService,
		MongoSessionService,
		JwtAccessStrategy,
		JwtRefreshStrategy,
	],
})
export class AuthModule {}

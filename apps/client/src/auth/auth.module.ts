import {
	Member,
	MemberData,
	MemberDataSchema,
	MemberRank,
	MemberRankSchema,
	MemberSchema,
	MongoSessionService,
	Rank,
	RankSchema,
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
			{ name: MemberData.name, schema: MemberDataSchema },
			{ name: MemberRank.name, schema: MemberRankSchema },
			{ name: Rank.name, schema: RankSchema },
		]),
		JwtModule.register({}),
	],
	controllers: [AuthController],
	providers: [ClientAuthService, MongoSessionService],
})
export class AuthModule {}

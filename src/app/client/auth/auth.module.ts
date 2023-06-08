import { TokenService } from '@/app/authentication/services/token.service'
import { JwtAccessStrategy } from '@/app/authentication/strategies/jwt-access.strategy'
import { JwtRefreshStrategy } from '@/app/authentication/strategies/jwt-refresh.strategy'
import { MongoSessionService } from '@/common/providers/mongo-session.service'
import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'
import { MemberData, MemberDataSchema } from '@schema/member-data.schema'
import { MemberRank, MemberRankSchema } from '@schema/member-rank.schema'
import { Member, MemberSchema } from '@schema/member.schema'
import { Rank, RankSchema } from '@schema/rank.schema'
import { RefreshToken, RefreshTokenSchema } from '@schema/refresh-token.schema'

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

import { MongoSessionService } from '@/common/providers/mongo-session.service'
import { MemberData, MemberDataSchema } from '@schema/member-data.schema'
import { MemberRank, MemberRankSchema } from '@schema/member-rank.schema'
import { Member, MemberSchema } from '@schema/member.schema'
import { Rank, RankSchema } from '@schema/rank.schema'
import { RefreshToken, RefreshTokenSchema } from '@schema/refresh-token.schema'
import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'

import { AuthMemberController } from './member-app/auth-member.controller'
import { AuthMemberService } from './member-app/auth-member.service'
import { SmsService } from './services/sms.service'
import { TokenService } from './services/token.service'
import { JwtAccessStrategy } from './strategies/jwt-access.strategy'
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy'

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
	controllers: [AuthMemberController],
	providers: [
		AuthMemberService,
		SmsService,
		TokenService,
		MongoSessionService,
		JwtAccessStrategy,
		JwtRefreshStrategy,
	],
})
export class AuthModule {}

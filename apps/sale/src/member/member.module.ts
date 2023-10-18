import {
	Member,
	MemberData,
	MemberDataSchema,
	MemberRank,
	MemberRankSchema,
	MemberSchema,
} from '@app/database'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { MemberController } from './member.controller'
import { MemberService } from './member.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Member.name, schema: MemberSchema },
			{ name: MemberData.name, schema: MemberDataSchema },
			{ name: MemberRank.name, schema: MemberRankSchema },
		]),
	],
	controllers: [MemberController],
	providers: [MemberService],
})
export class MemberModule {}

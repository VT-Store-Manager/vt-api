import {
	Member,
	MemberRank,
	MemberRankSchema,
	MemberSchema,
	Rank,
	RankSchema,
} from '@app/database'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { MemberRankController } from './member-rank.controller'
import { MemberRankService } from './member_rank.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Member.name, schema: MemberSchema },
			{ name: Rank.name, schema: RankSchema },
			{ name: MemberRank.name, schema: MemberRankSchema },
		]),
	],
	controllers: [MemberRankController],
	providers: [MemberRankService],
})
export class MemberRankModule {}

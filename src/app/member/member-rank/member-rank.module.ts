import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { MemberRank, MemberRankSchema } from '@schema/member-rank.schema'
import { Member, MemberSchema } from '@schema/member.schema'
import { Rank, RankSchema } from '@schema/rank.schema'

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

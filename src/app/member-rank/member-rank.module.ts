import { MemberRank, MemberRankSchema } from '@/schemas/member-rank.schema'
import { Member, MemberSchema } from '@/schemas/member.schema'
import { Rank, RankSchema } from '@/schemas/rank.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { MemberRankMemberController } from './member-app/member-rank_member.controller'
import { MemberRankMemberService } from './member-app/member_rank_member.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Member.name, schema: MemberSchema },
			{ name: Rank.name, schema: RankSchema },
			{ name: MemberRank.name, schema: MemberRankSchema },
		]),
	],
	controllers: [MemberRankMemberController],
	providers: [MemberRankMemberService],
	exports: [],
})
export class MemberRankModule {}

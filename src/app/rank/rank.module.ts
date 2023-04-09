import { MongoSessionService } from '@/providers/mongo/session.service'
import { Rank, RankSchema } from '@/schemas/rank.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { FileService } from '../file/file.service'
import { RankAdminController } from './admin-app/rank_admin.controller'
import { RankAdminService } from './admin-app/rank_admin.service'
import { RankMemberController } from './member-app/rank_member.controller'
import { RankMemberService } from './member-app/rank_member.service'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Rank.name, schema: RankSchema }]),
	],
	controllers: [RankAdminController, RankMemberController],
	providers: [
		RankAdminService,
		RankMemberService,
		FileService,
		MongoSessionService,
	],
	exports: [],
})
export class RankModule {}

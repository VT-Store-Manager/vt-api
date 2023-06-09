import { FileService } from '@/app/modules/file/file.service'
import { MongoSessionService } from '@/common/providers/mongo-session.service'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Rank, RankSchema } from '@schema/rank.schema'

import { RankController } from './rank.controller'
import { RankService } from './rank.service'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Rank.name, schema: RankSchema }]),
	],
	controllers: [RankController],
	providers: [RankService, FileService, MongoSessionService],
	exports: [],
})
export class RankModule {}

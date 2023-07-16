import { FileService } from '@/app/modules/file/file.service'
import { MongoSessionService } from '@app/common'
import { Rank, RankSchema } from '@app/database'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

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

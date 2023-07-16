import { FileService } from '@/app/modules/file/file.service'
import { MongoSessionService } from '@/common/providers/mongo-session.service'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { News, NewsSchema } from '@schema/news.schema'

import { NewsController } from './news.controller'
import { NewsService } from './news.service'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: News.name, schema: NewsSchema }]),
	],
	controllers: [NewsController],
	providers: [NewsService, FileService, MongoSessionService],
})
export class NewsModule {}

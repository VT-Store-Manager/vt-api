import { FileService } from '@/app/modules/file/file.service'
import { MongoSessionService } from '@app/common'
import { News, NewsSchema } from '@app/database'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

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

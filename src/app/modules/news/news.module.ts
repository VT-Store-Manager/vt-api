import { MongoSessionService } from '@/common/providers/mongo-session.service'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { News, NewsSchema } from '@schema/news.schema'
import { Tag, TagSchema } from '@schema/tag.schema'

import { FileService } from '../file/file.service'
import { NewsAdminController } from './admin-app/news_admin.controller'
import { NewsAdminService } from './admin-app/news_admin.service'
import { NewsMemberController } from './member-app/news_member.controller'
import { NewsMemberService } from './member-app/news_member.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: News.name, schema: NewsSchema },
			{ name: Tag.name, schema: TagSchema },
		]),
	],
	controllers: [NewsAdminController, NewsMemberController],
	providers: [
		NewsAdminService,
		NewsMemberService,
		FileService,
		MongoSessionService,
	],
})
export class NewsModule {}

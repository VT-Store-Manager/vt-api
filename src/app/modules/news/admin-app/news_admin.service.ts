import { Model } from 'mongoose'

import { News, NewsDocument } from '@/database/schemas/news.schema'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

@Injectable()
export class NewsAdminService {
	constructor(
		@InjectModel(News.name)
		private readonly newsModel: Model<NewsDocument>
	) {}
}

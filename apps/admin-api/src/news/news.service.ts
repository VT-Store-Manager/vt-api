import { ClientSession, Model } from 'mongoose'

import { News, NewsDocument } from '@app/database'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { CreateNewsDTO } from './dto/create-news.dto'

@Injectable()
export class NewsService {
	constructor(
		@InjectModel(News.name)
		private readonly newsModel: Model<NewsDocument>
	) {}

	async create(data: CreateNewsDTO, session?: ClientSession) {
		const [news] = await this.newsModel.create(
			[
				{
					...data,
				},
			],
			session ? { session } : {}
		)

		return news
	}
}

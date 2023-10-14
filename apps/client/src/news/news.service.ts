import { Model } from 'mongoose'

import { News, NewsDocument } from '@app/database'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'

import { NewsListByTagItemDTO } from './dto/response.dto'

@Injectable()
export class NewsService {
	private readonly imageUrl: string
	constructor(
		@InjectModel(News.name)
		private readonly newsModel: Model<NewsDocument>,
		private readonly configService: ConfigService
	) {
		this.imageUrl = configService.get<string>('imageUrl')
	}

	async getNewsList(): Promise<NewsListByTagItemDTO[]> {
		const newsByTag = await this.newsModel
			.aggregate<NewsListByTagItemDTO>([
				{
					$unwind: {
						path: '$tags',
					},
				},
				{
					$group: {
						_id: '$tags',
						news: {
							$push: {
								id: '$_id',
								name: '$name',
								image: {
									$concat: [this.imageUrl, '$image'],
								},
								content: '$content',
								url:
									this.configService.get<string>('host') +
									'/assets/html/coming-soon.html',
								time: { $toLong: '$createdAt' },
							},
						},
						lastUpdated: {
							$max: '$updatedAt',
						},
					},
				},
				{
					$lookup: {
						from: 'tags',
						localField: '_id',
						foreignField: '_id',
						as: 'tag',
					},
				},
				{
					$unwind: {
						path: '$tag',
					},
				},
				{
					$sort: {
						lastUpdated: -1,
						'tag.updatedAt': -1,
					},
				},
				{
					$project: {
						id: '$_id',
						_id: false,
						name: '$tag.name',
						news: '$news',
					},
				},
			])
			.exec()
		return newsByTag
	}
}

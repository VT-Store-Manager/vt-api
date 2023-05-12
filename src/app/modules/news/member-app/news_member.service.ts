import { Model } from 'mongoose'

import { imageUrl } from '@/common/helpers/file.helper'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { News, NewsDocument } from '@schema/news.schema'
import { Tag, TagDocument } from '@schema/tag.schema'

import { NewsListByTagItemDTO } from './dto/response.dto'

@Injectable()
export class NewsMemberService {
	constructor(
		@InjectModel(News.name)
		private readonly newsModel: Model<NewsDocument>,
		@InjectModel(Tag.name)
		private readonly tagModel: Model<TagDocument>,
		private readonly configService: ConfigService
	) {}

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
									$concat: [
										this.configService.get<string>('host'),
										imageUrl,
										'$image',
									],
								},
								url:
									this.configService.get<string>('host') +
									'/public/assets/html/coming-soon.html',
								time: '$createdAt',
							},
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

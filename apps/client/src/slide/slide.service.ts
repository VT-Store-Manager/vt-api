import { Model } from 'mongoose'

import { FileService } from '@app/common'
import { Slide, SlideDocument } from '@app/database'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { SlideItemDTO } from './dto/response.dto'
import { GetSlideQueryDTO } from './dto/get-slide-query.dto'

@Injectable()
export class SlideService {
	constructor(
		@InjectModel(Slide.name) private readonly slideModel: Model<SlideDocument>,
		private readonly fileService: FileService
	) {}

	async getAllSlides(query: GetSlideQueryDTO) {
		return await this.slideModel
			.aggregate<SlideItemDTO>([
				{
					$project: {
						id: '$_id',
						_id: false,
						image: this.fileService.getImageUrlExpression('$image'),
						url: { $ifNull: ['$url', null] },
					},
				},
				...(query.limit ? [{ $limit: query.limit }] : []),
			])
			.exec()
	}
}

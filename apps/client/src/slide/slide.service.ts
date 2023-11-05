import { Model } from 'mongoose'

import { FileService } from '@app/common'
import { Slide, SlideDocument } from '@app/database'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { SlideItemDTO } from './dto/response.dto'

@Injectable()
export class SlideService {
	constructor(
		@InjectModel(Slide.name) private readonly slideModel: Model<SlideDocument>,
		private readonly fileService: FileService
	) {}

	async getAllSlides() {
		return await this.slideModel
			.aggregate<SlideItemDTO>([
				{
					$project: {
						id: '$_id',
						_id: false,
						image: this.fileService.getImageUrlExpression('$image'),
						url: true,
					},
				},
			])
			.exec()
	}
}

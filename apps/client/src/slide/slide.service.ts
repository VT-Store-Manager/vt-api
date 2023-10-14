import { Slide, SlideDocument } from '@app/database'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { SlideItemDTO } from './dto/response.dto'

@Injectable()
export class SlideService {
	constructor(
		@InjectModel(Slide.name) private readonly slideModel: Model<SlideDocument>
	) {}

	async getAllSlides() {
		return await this.slideModel
			.aggregate<SlideItemDTO>([
				{
					$project: {
						id: '$_id',
						_id: false,
						image: true,
						url: true,
					},
				},
			])
			.exec()
	}
}

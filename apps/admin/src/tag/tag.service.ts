import { Model } from 'mongoose'

import { ErrorCode } from '@app/common'
import { Tag, TagDocument } from '@app/database'
import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { CreateTagDTO } from './dto/create-tag.dto'

@Injectable()
export class TagService {
	constructor(
		@InjectModel(Tag.name)
		private readonly tagModel: Model<TagDocument>
	) {}

	async createData(data: CreateTagDTO) {
		try {
			const tag = await this.tagModel.create({ ...data })
			return tag
		} catch (error) {
			if (error.code === ErrorCode.MONGO_DUPLICATED) {
				throw new BadRequestException('Tag name is duplicated')
			} else {
				throw new InternalServerErrorException(error.message)
			}
		}
	}
}

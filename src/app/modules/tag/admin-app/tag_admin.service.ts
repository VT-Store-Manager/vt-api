import { Model } from 'mongoose'

import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Tag, TagDocument } from '@schema/tag.schema'

import { CreateTagDTO } from './dto/create-tag.dto'
import { ErrorCode } from '@/common/constants'

@Injectable()
export class TagAdminService {
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

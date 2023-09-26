import { Body, Controller, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { CreateTagDTO } from './dto/create-tag.dto'
import { TagService } from './tag.service'

@Controller('admin/tag')
@ApiTags('admin-app > tag')
export class TagController {
	constructor(private readonly tagService: TagService) {}

	@Post('create')
	async createTag(@Body() body: CreateTagDTO) {
		const tag = await this.tagService.createData(body)

		return { id: tag._id }
	}
}

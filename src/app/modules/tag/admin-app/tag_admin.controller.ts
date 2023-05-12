import { Body, Controller, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { CreateTagDTO } from './dto/create-tag.dto'
import { TagAdminService } from './tag_admin.service'

@Controller({
	path: 'admin/tag',
	version: '1',
})
@ApiTags('admin-app > tag')
export class TagAdminController {
	constructor(private readonly tagService: TagAdminService) {}

	@Post('create')
	async createTag(@Body() body: CreateTagDTO) {
		const tag = await this.tagService.createData(body)

		return { id: tag._id }
	}
}

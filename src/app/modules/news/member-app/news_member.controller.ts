import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { NewsMemberService } from './news_member.service'
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { NewsListByTagItemDTO } from './dto/response.dto'

@Controller({
	path: 'member/news',
	version: '1',
})
@ApiTags('member-app > news')
export class NewsMemberController {
	constructor(private readonly newsService: NewsMemberService) {}

	@Get()
	@ApiSuccessResponse(NewsListByTagItemDTO, 200, true)
	async getNewsWithTag() {
		return await this.newsService.getNewsList()
	}
}

import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { NewsService } from './news.service'
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { NewsListByTagItemDTO } from './dto/response.dto'

@Controller({
	path: 'member/news',
	version: '1',
})
@ApiTags('member-app > news')
export class NewsController {
	constructor(private readonly newsService: NewsService) {}

	@Get()
	@ApiSuccessResponse(NewsListByTagItemDTO, 200, true)
	async getNewsWithTag() {
		return await this.newsService.getNewsList()
	}
}

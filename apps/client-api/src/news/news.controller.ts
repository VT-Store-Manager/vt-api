import { ApiSuccessResponse } from '@app/common'
import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { NewsListByTagItemDTO } from './dto/response.dto'
import { NewsService } from './news.service'

@Controller('member/news')
@ApiTags('member-app > news')
export class NewsController {
	constructor(private readonly newsService: NewsService) {}

	@Get()
	@ApiSuccessResponse(NewsListByTagItemDTO, 200, true)
	async getNewsWithTag() {
		return await this.newsService.getNewsList()
	}
}

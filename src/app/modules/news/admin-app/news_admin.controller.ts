import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { NewsAdminService } from './news_admin.service'

@Controller({
	path: 'member/news',
	version: '1',
})
@ApiTags('member-app > news')
export class NewsAdminController {
	constructor(private readonly newsService: NewsAdminService) {}
}

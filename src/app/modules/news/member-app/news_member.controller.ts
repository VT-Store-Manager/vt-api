import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { NewsMemberService } from './news_member.service'

@Controller({
	path: 'member/news',
	version: '1',
})
@ApiTags('member-app > news')
export class NewsMemberController {
	constructor(private readonly newsService: NewsMemberService) {}
}

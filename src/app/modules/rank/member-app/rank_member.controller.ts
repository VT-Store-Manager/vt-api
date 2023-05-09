import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { RankMemberService } from './rank_member.service'

@Controller({
	path: 'member/rank',
	version: '1',
})
@ApiTags('member-app > rank')
export class RankMemberController {
	constructor(private readonly rankMemberService: RankMemberService) {}
}

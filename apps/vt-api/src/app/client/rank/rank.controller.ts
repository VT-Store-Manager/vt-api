import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { RankService } from './rank.service'

@Controller({
	path: 'member/rank',
	version: '1',
})
@ApiTags('member-app > rank')
export class RankController {
	constructor(private readonly rankService: RankService) {}
}

import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { RankService } from './rank.service'

@Controller('member/rank')
@ApiTags('member-app > rank')
export class RankController {
	constructor(private readonly rankService: RankService) {}
}

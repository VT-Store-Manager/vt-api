import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { PromotionMemberService } from './promotion_member.service'

@Controller({
	path: 'member/promotion',
	version: '1',
})
@ApiTags('member-app > promotion')
export class PromotionMemberController {
	constructor(
		private readonly promotionMemberService: PromotionMemberService
	) {}
}

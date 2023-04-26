import { CurrentUser } from '@/app/auth/decorators/current-user.decorator'
import { JwtAccess } from '@/app/auth/decorators/jwt.decorator'
import { Role } from '@/common/constants'
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { UserPayload } from '@/types/token.dto'
import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { PromotionItemDTO } from './dto/response.dto'

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

	@Get('all')
	@JwtAccess(Role.MEMBER)
	@ApiSuccessResponse(PromotionItemDTO, 200, true)
	async getAllPromotion(@CurrentUser() member: UserPayload) {
		return await this.promotionMemberService.getAll(member.sub)
	}
}

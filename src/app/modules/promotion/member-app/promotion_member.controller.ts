import { CurrentUser } from '@module/auth/decorators/current-user.decorator'
import { JwtAccess } from '@module/auth/decorators/jwt.decorator'
import { Role } from '@/common/constants'
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { ObjectIdPipe } from '@/common/pipes/object-id.pipe'
import { MongoSessionService } from '@/common/providers/mongo-session.service'
import { BooleanResponseDTO } from '@/types/swagger'
import { Controller, Get, Param, Post } from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'

import { PromotionItemDTO } from './dto/response.dto'
import { PromotionMemberService } from './promotion_member.service'

@Controller({
	path: 'member/promotion',
	version: '1',
})
@ApiTags('member-app > promotion')
export class PromotionMemberController {
	constructor(
		private readonly promotionMemberService: PromotionMemberService,
		private readonly mongoSessionService: MongoSessionService
	) {}

	@Get('all')
	@JwtAccess(Role.MEMBER)
	@ApiSuccessResponse(PromotionItemDTO, 200, true)
	async getAllPromotion(@CurrentUser('sub') memberId: string) {
		return await this.promotionMemberService.getAll(memberId)
	}

	@Post(':promotionId/exchange')
	@JwtAccess(Role.MEMBER)
	@ApiResponse({ type: BooleanResponseDTO, status: 201 })
	async exchangeVoucher(
		@CurrentUser('sub') memberId: string,
		@Param('promotionId', ObjectIdPipe) promotionId: string
	) {
		const { error } = await this.mongoSessionService.execTransaction(
			async session => {
				await this.promotionMemberService.exchangeVoucher(
					memberId,
					promotionId,
					session
				)
			}
		)
		if (error) {
			throw error
		}
		return true
	}
}

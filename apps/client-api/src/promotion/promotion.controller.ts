import { CurrentUser, JwtAccess } from '@app/authentication'
import { ApiSuccessResponse, ObjectIdPipe, Role } from '@app/common'
import { MongoSessionService } from '@app/database'
import { BooleanResponseDTO } from '@app/types'
import { Controller, Get, Param, Post } from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'

import { PromotionItemDTO } from './dto/response.dto'
import { PromotionService } from './promotion.service'

@Controller({
	path: 'member/promotion',
	version: '1',
})
@ApiTags('member-app > promotion')
export class PromotionController {
	constructor(
		private readonly promotionService: PromotionService,
		private readonly mongoSessionService: MongoSessionService
	) {}

	@Get('all')
	@JwtAccess(Role.MEMBER)
	@ApiSuccessResponse(PromotionItemDTO, 200, true)
	async getAllPromotion(@CurrentUser('sub') memberId: string) {
		return await this.promotionService.getAll(memberId)
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
				await this.promotionService.exchangeVoucher(
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

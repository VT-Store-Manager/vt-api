import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { PromotionCategoryItemDTO } from './dto/response.dto'
import { PromotionCategoryMemberService } from './promotion-category_member.service'

@Controller({
	path: 'member/promotion-category',
	version: '1',
})
@ApiTags('member-app > promotion-category')
export class PromotionCategoryMemberController {
	constructor(
		private readonly promotionCategoryService: PromotionCategoryMemberService
	) {}

	@Get('all')
	@ApiSuccessResponse(PromotionCategoryItemDTO, 200, true)
	async getAllPromotionCategories() {
		return await this.promotionCategoryService.getAll()
	}
}

import { ApiSuccessResponse } from '@app/common'
import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { PromotionCategoryItemDTO } from './dto/response.dto'
import { PromotionCategoryService } from './promotion-category.service'

@Controller('member/promotion-category')
@ApiTags('member-app > promotion-category')
export class PromotionCategoryController {
	constructor(
		private readonly promotionCategoryService: PromotionCategoryService
	) {}

	@Get('all')
	@ApiSuccessResponse(PromotionCategoryItemDTO, 200, true)
	async getAllPromotionCategories() {
		return await this.promotionCategoryService.getAll()
	}
}

import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { GetAllProductOptionDTO } from './dto/response.dto'
import { ProductOptionMemberService } from './product-option_member.service'

@Controller({
	path: 'member/product-option',
	version: '1',
})
@ApiTags('member-app > product-option')
export class ProductOptionMemberController {
	constructor(
		private readonly productOptionMemberService: ProductOptionMemberService
	) {}

	@Get('all')
	@ApiSuccessResponse(GetAllProductOptionDTO, 200, true)
	async getAllProductOption() {
		return await this.productOptionMemberService.getAllProductOptions()
	}
}

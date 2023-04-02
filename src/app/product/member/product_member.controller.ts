import { ApiSuccessResponse } from '@/common/decorators/api-sucess-response.decorator'
import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { ShortProductItemDTO } from './dto/response-short-product-item.dto'
import { ProductMemberService } from './product_member.service'

@Controller('member/product')
@ApiTags('member-app > product')
export class ProductMemberController {
	constructor(private readonly productMemberService: ProductMemberService) {}

	@Get('all-in-short')
	@ApiSuccessResponse(ShortProductItemDTO, 200, true)
	async getAllProductInShort() {
		return await this.productMemberService.getShortInfoAllProduct()
	}
}

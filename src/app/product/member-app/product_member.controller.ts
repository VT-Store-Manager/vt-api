import { CurrentUser } from '@/app/auth/decorators/current-user.decorator'
import { JwtAccess } from '@/app/auth/decorators/jwt.decorator'
import { ApiSuccessResponse } from '@/common/decorators/api-sucess-response.decorator'
import { ObjectIdPipe } from '@/common/pipes/object-id.pipe'
import { AccessTokenPayload } from '@/types/token.jwt'
import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiQuery, ApiTags } from '@nestjs/swagger'

import { GetProductSuggestionDTO } from './dto/get-product-suggestion.dto'
import { DetailProductDTO, ShortProductItemDTO } from './dto/response.dto'
import { ProductMemberService } from './product_member.service'

@Controller({
	path: 'member/product',
	version: '1',
})
@ApiTags('member-app > product')
export class ProductMemberController {
	constructor(private readonly productMemberService: ProductMemberService) {}

	@Get('all-in-short')
	@ApiSuccessResponse(ShortProductItemDTO, 200, true)
	async getAllProductInShort() {
		return await this.productMemberService.getShortInfoAllProduct()
	}

	@Get('suggestion')
	@JwtAccess()
	@ApiSuccessResponse(ShortProductItemDTO, 200, true)
	@ApiQuery({ name: 'limit', required: false, type: Number })
	async getProductSuggestionList(
		@CurrentUser() user: AccessTokenPayload,
		@Query() dto: GetProductSuggestionDTO
	) {
		return await this.productMemberService.getSuggestionList(
			user.uid,
			dto.limit
		)
	}

	@Get(':id')
	@JwtAccess()
	@ApiSuccessResponse(DetailProductDTO)
	@ApiQuery({ name: 'storeId', required: false, type: String })
	async getDetailProduct(
		@CurrentUser() user: AccessTokenPayload,
		@Param('id', ObjectIdPipe) productId: string,
		@Query('storeId', ObjectIdPipe) storeId?: string
	) {
		return await this.productMemberService.getDetailProduct(
			user.uid,
			productId,
			storeId
		)
	}
}

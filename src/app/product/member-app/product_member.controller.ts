import { CurrentUser } from '@/app/auth/decorators/current-user.decorator'
import { JwtAccess } from '@/app/auth/decorators/jwt.decorator'
import { Role } from '@/common/constants'
import { ApiSuccessResponse } from '@/common/decorators/api-sucess-response.decorator'
import { ObjectIdPipe } from '@/common/pipes/object-id.pipe'
import { TokenPayload } from '@/types/token.dto'
import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger'

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
	@JwtAccess(Role.MEMBER)
	@ApiSuccessResponse(ShortProductItemDTO, 200, true)
	@ApiQuery({
		name: 'limit',
		required: false,
		type: Number,
		description: 'Max amount of suggestion',
	})
	async getProductSuggestionList(
		@CurrentUser() user: TokenPayload,
		@Query() dto: GetProductSuggestionDTO
	) {
		return await this.productMemberService.getSuggestionList(
			user.sub,
			dto.limit
		)
	}

	@Get(':id')
	@JwtAccess(Role.MEMBER)
	@ApiSuccessResponse(DetailProductDTO)
	@ApiParam({
		name: 'id',
		type: String,
		description: 'ID of product',
	})
	@ApiQuery({
		name: 'storeId',
		required: false,
		type: String,
		description: 'ID of selected store',
	})
	async getDetailProduct(
		@CurrentUser() user: TokenPayload,
		@Param('id', ObjectIdPipe) productId: string,
		@Query('storeId', ObjectIdPipe) storeId?: string
	) {
		return await this.productMemberService.getDetailProduct(
			user.sub,
			productId,
			storeId
		)
	}
}

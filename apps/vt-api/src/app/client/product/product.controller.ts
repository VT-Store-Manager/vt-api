import { CurrentUser } from '@/app/authentication/decorators/current-user.decorator'
import { JwtAccess } from '@/app/authentication/decorators/jwt.decorator'
import { Role } from '@/common/constants'
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { ObjectIdPipe } from '@/common/pipes/object-id.pipe'
import { BooleanResponseDTO } from '@/types/swagger'
import { Controller, Get, Param, Patch, Query } from '@nestjs/common'
import { ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'

import { GetProductSuggestionDTO } from './dto/get-product-suggestion.dto'
import {
	DetailProductDTO,
	ProductListIdDTO,
	ProductListItemDTO,
} from './dto/response.dto'
import { ProductService } from './product.service'

@Controller({
	path: 'member/product',
	version: '1',
})
@ApiTags('member-app > product')
export class ProductMemberController {
	constructor(private readonly productService: ProductService) {}

	@Get('all')
	@ApiSuccessResponse(ProductListItemDTO, 200, true)
	async getAllProducts() {
		return await this.productService.getAllProducts()
	}

	@Get('suggestion')
	@JwtAccess(Role.MEMBER)
	@ApiSuccessResponse(ProductListIdDTO)
	@ApiQuery({
		name: 'limit',
		required: false,
		type: Number,
		description: 'Max amount of suggestion',
	})
	async getProductSuggestionList(
		@CurrentUser('sub') memberId: string,
		@Query() dto: GetProductSuggestionDTO
	) {
		return await this.productService.getSuggestionList(memberId, dto.limit)
	}

	@Patch(':id/favorite')
	@JwtAccess(Role.MEMBER)
	@ApiResponse({ type: BooleanResponseDTO })
	async changeFavoriteProduct(
		@CurrentUser('sub') memberId: string,
		@Param('id') productId: string
	) {
		return await this.productService.toggleFavoriteProduct(memberId, productId)
	}

	@Get('favorite/all')
	@JwtAccess(Role.MEMBER)
	@ApiSuccessResponse(ProductListIdDTO)
	async getAllFavoriteProducts(@CurrentUser('sub') memberId: string) {
		return await this.productService.getAllFavorites(memberId)
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
		@CurrentUser('sub') memberId: string,
		@Param('id', ObjectIdPipe) productId: string,
		@Query('storeId', ObjectIdPipe) storeId?: string
	) {
		return await this.productService.getDetailProduct(
			memberId,
			productId,
			storeId
		)
	}
}

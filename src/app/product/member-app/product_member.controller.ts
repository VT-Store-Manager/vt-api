import { CurrentUser } from '@/app/auth/decorators/current-user.decorator'
import { JwtAccess } from '@/app/auth/decorators/jwt.decorator'
import { ApiSuccessResponse } from '@/common/decorators/api-sucess-response.decorator'
import { ObjectIdPipe } from '@/common/pipes/object-id.pipe'
import { AccessTokenPayload } from '@/types/token.jwt'
import { Controller, Get, Param } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { DetailProductDTO, ShortProductItemDTO } from './dto/response.dto'
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

	@Get(':id')
	@JwtAccess()
	@ApiSuccessResponse(DetailProductDTO)
	async getDetailProduct(
		@CurrentUser() user: AccessTokenPayload,
		@Param('id', ObjectIdPipe) productId: string
	) {
		return await this.productMemberService.getDetailProduct(user.uid, productId)
	}
}

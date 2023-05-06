import { CurrentUser } from '@/app/auth/decorators/current-user.decorator'
import { JwtAccess } from '@/app/auth/decorators/jwt.decorator'
import { Role } from '@/common/constants'
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { UserPayload } from '@/types/token.dto'
import { Body, Controller, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { CartTemplateMemberService } from './cart-template_member.service'
import { CreateCartTemplateDTO } from './dto/create-cart-template.dto'
import { CreateCartTemplateResponseDTO } from './dto/response.dto'

@Controller({
	path: 'member/cart-template',
	version: '1',
})
@ApiTags('member-app > cart-template')
export class CartTemplateMemberController {
	constructor(
		private readonly cartTemplateService: CartTemplateMemberService
	) {}

	@Post()
	@JwtAccess(Role.MEMBER)
	@ApiSuccessResponse(CreateCartTemplateResponseDTO, 201)
	async createCartTemplate(
		@CurrentUser() { sub: userId }: UserPayload,
		@Body() body: CreateCartTemplateDTO
	) {
		const template = await this.cartTemplateService.create(userId, body)
		return { id: template._id }
	}
}

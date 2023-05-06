import { CurrentUser } from '@/app/auth/decorators/current-user.decorator'
import { JwtAccess } from '@/app/auth/decorators/jwt.decorator'
import { SettingMemberAppService } from '@/app/setting/services/setting-member-app.service'
import { Role } from '@/common/constants'
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { SettingMemberApp } from '@/schemas/setting-member-app.schema'
import { UserPayload } from '@/types/token.dto'
import { Body, Controller, Get, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { CartTemplateMemberService } from './cart-template_member.service'
import { CreateCartTemplateDTO } from './dto/create-cart-template.dto'
import {
	CreateCartTemplateResponseDTO,
	GetAllCartTemplateResponseDTO,
} from './dto/response.dto'

@Controller({
	path: 'member/cart-template',
	version: '1',
})
@ApiTags('member-app > cart-template')
export class CartTemplateMemberController {
	constructor(
		private readonly cartTemplateService: CartTemplateMemberService,
		private readonly settingMemberAppService: SettingMemberAppService
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

	@Get('all')
	@JwtAccess(Role.MEMBER)
	@ApiSuccessResponse(GetAllCartTemplateResponseDTO)
	async getAllCartTemplate(
		@CurrentUser() { sub: memberId }: UserPayload
	): Promise<GetAllCartTemplateResponseDTO> {
		const [memberAppSetting, cartTemplates] = await Promise.all([
			this.settingMemberAppService.getData<Pick<SettingMemberApp, 'limit'>>({
				limit: true,
			}),
			await this.cartTemplateService.getAll(memberId),
		])

		const limit = memberAppSetting.limit.cartTemplate ?? 10
		return {
			limit,
			cartTemplate: cartTemplates,
		}
	}
}

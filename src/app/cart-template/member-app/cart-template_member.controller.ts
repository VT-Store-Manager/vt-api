import { CurrentUser } from '@/app/auth/decorators/current-user.decorator'
import { JwtAccess } from '@/app/auth/decorators/jwt.decorator'
import { SettingMemberAppService } from '@/app/setting/services/setting-member-app.service'
import { Role } from '@/common/constants'
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { NotEmptyObjectPipe } from '@/common/pipes/object.pipe'
import { SettingMemberApp } from '@/schemas/setting-member-app.schema'
import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'

import { CartTemplateMemberService } from './cart-template_member.service'
import { CreateCartTemplateDTO } from './dto/create-cart-template.dto'
import { EditCartTemplateDTO } from './dto/edit-cart-template.dto'
import {
	CreateCartTemplateResponseDTO,
	EditCartTemplateResultDTO,
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
		@CurrentUser('sub') memberId: string,
		@Body() body: CreateCartTemplateDTO
	) {
		const template = await this.cartTemplateService.create(memberId, body)
		return { id: template._id }
	}

	@Get('all')
	@JwtAccess(Role.MEMBER)
	@ApiSuccessResponse(GetAllCartTemplateResponseDTO)
	async getAllCartTemplate(
		@CurrentUser('sub') memberId: string
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

	@Put(':templateId')
	@JwtAccess()
	@ApiResponse({ type: EditCartTemplateResultDTO, status: 200 })
	async editCartTemplate(
		@CurrentUser('sub') memberId: string,
		@Param('templateId') templateId: string,
		@Body(NotEmptyObjectPipe) body: EditCartTemplateDTO
	) {
		return await this.cartTemplateService.edit(memberId, templateId, body)
	}
}

import { CurrentUser } from '@/app/auth/decorators/current-user.decorator'
import { JwtAccess } from '@/app/auth/decorators/jwt.decorator'
import { SettingMemberAppService } from '@/app/setting/services/setting-member-app.service'
import { DEFAULT_MAX_CART_TEMPLATE, Role } from '@/common/constants'
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import {
	NotEmptyObjectPipe,
	RemoveNullishObjectPipe,
} from '@/common/pipes/object.pipe'
import { SettingMemberApp } from '@/schemas/setting-member-app.schema'
import { BooleanResponseDTO } from '@/types/http.swagger'
import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Put,
} from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'

import { CartTemplateMemberService } from './cart-template_member.service'
import { ArrangeCartTemplateDTO } from './dto/arrange-cart-template.dto'
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
		const [{ cartTemplate }, countCartTemplates] = await Promise.all([
			this.settingMemberAppService.getData<
				Pick<SettingMemberApp, 'cartTemplate'>
			>({
				cartTemplate: true,
			}),
			this.cartTemplateService.count(memberId),
		])
		const maxAmount = cartTemplate.limit || DEFAULT_MAX_CART_TEMPLATE
		if (countCartTemplates >= maxAmount) {
			throw new BadRequestException(
				`Reached max amount of cart template (${maxAmount} items)`
			)
		}
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
			this.settingMemberAppService.getData<
				Pick<SettingMemberApp, 'cartTemplate'>
			>({
				cartTemplate: true,
			}),
			await this.cartTemplateService.getAll(memberId),
		])

		const limit =
			memberAppSetting.cartTemplate.limit ?? DEFAULT_MAX_CART_TEMPLATE
		return {
			limit,
			cartTemplate: cartTemplates,
		}
	}

	@Put(':templateId')
	@JwtAccess(Role.MEMBER)
	@ApiSuccessResponse(EditCartTemplateResultDTO)
	async editCartTemplate(
		@CurrentUser('sub') memberId: string,
		@Param('templateId') templateId: string,
		@Body(RemoveNullishObjectPipe, NotEmptyObjectPipe) body: EditCartTemplateDTO
	) {
		return await this.cartTemplateService.edit(memberId, templateId, body)
	}

	@Patch('arrange')
	@JwtAccess(Role.MEMBER)
	@ApiResponse({ type: BooleanResponseDTO, status: 200 })
	async arrangeCartTemplate(
		@CurrentUser('sub') memberId: string,
		@Body() body: ArrangeCartTemplateDTO
	) {
		return await this.cartTemplateService.arrange(memberId, body)
	}

	@Delete(':templateId')
	@JwtAccess(Role.MEMBER)
	@ApiResponse({ type: BooleanResponseDTO, status: 200 })
	async deleteCartTemplate(
		@CurrentUser('sub') memberId: string,
		@Param('templateId') templateId: string
	) {
		return await this.cartTemplateService.delete(memberId, templateId)
	}
}

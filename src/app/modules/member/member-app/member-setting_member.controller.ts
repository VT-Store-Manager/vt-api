import { CurrentUser } from '@module/auth/decorators/current-user.decorator'
import { JwtAccess } from '@module/auth/decorators/jwt.decorator'
import { Role } from '@/common/constants'
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { ObjectIdPipe } from '@/common/pipes/object-id.pipe'
import {
	NotEmptyObjectPipe,
	RemoveNullishObjectPipe,
} from '@/common/pipes/object.pipe'
import { BooleanResponseDTO } from '@/types/swagger'
import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'

import { CreateMemberAddressDTO } from './dto/create-member-address.dto'
import {
	CreateAddressResultDTO,
	GetMemberAddressDTO,
	MemberProfileDTO,
} from './dto/response.dto'
import { UpdateMemberAddressDTO } from './dto/update-member-address.dto'
import { UpdateProfileDTO } from './dto/update-profile.dto'
import { MemberSettingService } from './member-setting_member.service'

@Controller({
	path: 'member/setting',
	version: '1',
})
@ApiTags('member-app > setting')
export class MemberSettingController {
	constructor(private readonly memberSettingService: MemberSettingService) {}

	@Get('profile')
	@JwtAccess(Role.MEMBER)
	@ApiSuccessResponse(MemberProfileDTO)
	async getMemberProfile(@CurrentUser('sub') memberId: string) {
		return await this.memberSettingService.getProfile(memberId)
	}

	@Put('profile')
	@JwtAccess(Role.MEMBER)
	@ApiResponse({ type: BooleanResponseDTO, status: 200 })
	async updateMemberProfile(
		@CurrentUser('sub') memberId: string,
		@Body(RemoveNullishObjectPipe, NotEmptyObjectPipe) body: UpdateProfileDTO
	) {
		return await this.memberSettingService.updateProfile(memberId, body)
	}

	@Post('address')
	@JwtAccess(Role.MEMBER)
	@ApiSuccessResponse(CreateAddressResultDTO, 201)
	async createAddress(
		@CurrentUser('sub') memberId: string,
		@Body() body: CreateMemberAddressDTO
	): Promise<CreateAddressResultDTO> {
		const address = await this.memberSettingService.addNewAddress(
			memberId,
			body
		)
		return {
			id: address._id.toString(),
		}
	}

	@Get('address')
	@JwtAccess(Role.MEMBER)
	@ApiSuccessResponse(GetMemberAddressDTO)
	async getAddress(@CurrentUser('sub') memberId: string) {
		return this.memberSettingService.getAddress(memberId)
	}

	@Put('address/:addressId')
	@JwtAccess(Role.MEMBER)
	@ApiResponse({ type: BooleanResponseDTO, status: 200 })
	async updateAddress(
		@CurrentUser('sub') memberId: string,
		@Param('addressId', ObjectIdPipe) addressId: string,
		@Body() body: UpdateMemberAddressDTO
	) {
		return await this.memberSettingService.updateAddress(
			memberId,
			addressId,
			body
		)
	}

	@Delete('address/:addressId')
	@JwtAccess(Role.MEMBER)
	@ApiResponse({ type: BooleanResponseDTO, status: 200 })
	async deleteAddress(
		@CurrentUser('sub') memberId: string,
		@Param('addressId', ObjectIdPipe) addressId: string
	) {
		return await this.memberSettingService.deleteAddress(memberId, addressId)
	}
}

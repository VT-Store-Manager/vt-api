import { CurrentUser, JwtAccess } from '@app/authentication'
import {
	ApiSuccessResponse,
	NotEmptyObjectPipe,
	ObjectIdPipe,
	RemoveNullishObjectPipe,
	Role,
} from '@app/common'
import { BooleanResponseDTO } from '@app/types'
import {
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

import { CreateMemberAddressDTO } from '../dto/create-member-address.dto'
import {
	CreateAddressResultDTO,
	GetMemberAddressDTO,
	MemberProfileDTO,
} from '../dto/response.dto'
import { UpdateMemberAddressDTO } from '../dto/update-member-address.dto'
import { UpdateProfileDTO } from '../dto/update-profile.dto'
import { MemberService } from '../member.service'

@Controller('member/setting')
@ApiTags('member-app > setting')
export class MemberSettingController {
	constructor(private readonly memberService: MemberService) {}

	@Get('profile')
	@JwtAccess(Role.MEMBER)
	@ApiSuccessResponse(MemberProfileDTO)
	async getMemberProfile(@CurrentUser('sub') memberId: string) {
		return await this.memberService.getProfile(memberId)
	}

	@Put('profile')
	@JwtAccess(Role.MEMBER)
	@ApiResponse({ type: BooleanResponseDTO, status: 200 })
	async updateMemberProfile(
		@CurrentUser('sub') memberId: string,
		@Body(RemoveNullishObjectPipe, NotEmptyObjectPipe) body: UpdateProfileDTO
	) {
		return await this.memberService.updateProfile(memberId, body)
	}

	@Post('address')
	@JwtAccess(Role.MEMBER)
	@ApiSuccessResponse(CreateAddressResultDTO, 201)
	async createAddress(
		@CurrentUser('sub') memberId: string,
		@Body() body: CreateMemberAddressDTO
	): Promise<CreateAddressResultDTO> {
		const address = await this.memberService.addNewAddress(memberId, body)
		return {
			id: address._id.toString(),
		}
	}

	@Get('address')
	@JwtAccess(Role.MEMBER)
	@ApiSuccessResponse(GetMemberAddressDTO)
	async getAddress(@CurrentUser('sub') memberId: string) {
		return this.memberService.getAddress(memberId)
	}

	@Put('address/:addressId')
	@JwtAccess(Role.MEMBER)
	@ApiResponse({ type: BooleanResponseDTO, status: 200 })
	async updateAddress(
		@CurrentUser('sub') memberId: string,
		@Param('addressId', ObjectIdPipe) addressId: string,
		@Body() body: UpdateMemberAddressDTO
	) {
		return await this.memberService.updateAddress(memberId, addressId, body)
	}

	@Delete('address/:addressId')
	@JwtAccess(Role.MEMBER)
	@ApiResponse({ type: BooleanResponseDTO, status: 200 })
	async deleteAddress(
		@CurrentUser('sub') memberId: string,
		@Param('addressId', ObjectIdPipe) addressId: string
	) {
		return await this.memberService.deleteAddress(memberId, addressId)
	}

	@Patch('notification')
	@JwtAccess(Role.MEMBER)
	@ApiResponse({ type: BooleanResponseDTO, status: 200 })
	async togglePushNotification(@CurrentUser('sub') memberId: string) {
		return await this.memberService.togglePushNotification(memberId)
	}
}

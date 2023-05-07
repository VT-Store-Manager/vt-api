import { CurrentUser } from '@/app/auth/decorators/current-user.decorator'
import { JwtAccess } from '@/app/auth/decorators/jwt.decorator'
import { Role } from '@/common/constants'
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import {
	NotEmptyObjectPipe,
	RemoveNullishObjectPipe,
} from '@/common/pipes/object.pipe'
import { BooleanResponseDTO } from '@/types/http.swagger'
import { Body, Controller, Get, Put } from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'

import { MemberProfileDTO } from './dto/response.dto'
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
}

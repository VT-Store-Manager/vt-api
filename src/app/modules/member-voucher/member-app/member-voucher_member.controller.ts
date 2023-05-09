import { CurrentUser } from '@module/auth/decorators/current-user.decorator'
import { JwtAccess } from '@module/auth/decorators/jwt.decorator'
import { Role } from '@/common/constants'
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import {
	AvailableMemberVoucherDTO,
	UsedMemberVoucherDTO,
} from './dto/response.dto'
import { MemberVoucherMemberService } from './member-voucher_member.service'

@Controller({
	path: 'member/voucher',
	version: '1',
})
@ApiTags('member-app > member-voucher')
export class MemberVoucherMemberController {
	constructor(
		private readonly memberVoucherMemberService: MemberVoucherMemberService
	) {}

	@Get('available')
	@JwtAccess(Role.MEMBER)
	@ApiSuccessResponse(AvailableMemberVoucherDTO, 200, true)
	async getAvailableVoucherList(@CurrentUser('sub') memberId: string) {
		return await this.memberVoucherMemberService.getMemberAvailableVoucher(
			memberId
		)
	}

	@Get('used')
	@JwtAccess(Role.MEMBER)
	@ApiSuccessResponse(UsedMemberVoucherDTO, 200, true)
	async getUsedVoucherList(@CurrentUser('sub') memberId: string) {
		return await this.memberVoucherMemberService.getMemberUsedVoucher(memberId)
	}
}

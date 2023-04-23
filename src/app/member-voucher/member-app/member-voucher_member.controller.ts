import { CurrentUser } from '@/app/auth/decorators/current-user.decorator'
import { JwtAccess } from '@/app/auth/decorators/jwt.decorator'
import { Role } from '@/common/constants'
import { ApiSuccessResponse } from '@/common/decorators/api-sucess-response.decorator'
import { UserPayload } from '@/types/token.dto'
import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { AvailableMemberVoucherDTO } from '../admin-app/dto/response.dto'
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
	async getAvailableVoucherList(@CurrentUser() user: UserPayload) {
		return await this.memberVoucherMemberService.getMemberAvailableVoucher(
			user.sub
		)
	}
}
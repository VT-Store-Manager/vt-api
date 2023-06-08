import { CurrentUser } from '@/app/authentication/decorators/current-user.decorator'
import { JwtAccess } from '@/app/authentication/decorators/jwt.decorator'
import { Role } from '@/common/constants'
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import {
	AvailableMemberVoucherDTO,
	UsedMemberVoucherDTO,
} from './dto/response.dto'
import { MemberVoucherService } from './member-voucher.service'

@Controller({
	path: 'member/voucher',
	version: '1',
})
@ApiTags('member-app > member-voucher')
export class MemberVoucherController {
	constructor(private readonly memberVoucherService: MemberVoucherService) {}

	@Get('available')
	@JwtAccess(Role.MEMBER)
	@ApiSuccessResponse(AvailableMemberVoucherDTO, 200, true)
	async getAvailableVoucherList(@CurrentUser('sub') memberId: string) {
		return await this.memberVoucherService.getMemberAvailableVoucher(memberId)
	}

	@Get('used')
	@JwtAccess(Role.MEMBER)
	@ApiSuccessResponse(UsedMemberVoucherDTO, 200, true)
	async getUsedVoucherList(@CurrentUser('sub') memberId: string) {
		return await this.memberVoucherService.getMemberUsedVoucher(memberId)
	}
}

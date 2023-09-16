import { CurrentUser, JwtAccess } from '@app/authentication'
import { ApiSuccessResponse, Role } from '@app/common'
import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import {
	AvailableMemberVoucherDTO,
	UsedMemberVoucherDTO,
} from './dto/response.dto'
import { MemberVoucherService } from './member-voucher.service'

@Controller('member/voucher')
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

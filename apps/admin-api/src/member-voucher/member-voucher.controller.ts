import { ApiSuccessResponse } from '@app/common'
import { Body, Controller, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { AssignVoucherDTO } from './dto/create-member-voucher.dto'
import { CreateMemberVoucherDTO } from './dto/response.dto'
import { MemberVoucherService } from './member-voucher.service'

@Controller('admin/member-voucher')
@ApiTags('admin-app > member-voucher')
export class MemberVoucherController {
	constructor(
		private readonly memberVoucherAdminService: MemberVoucherService
	) {}

	@Post('create')
	// @JwtAccess() //TODO: Change to Role.ADMIN
	@ApiSuccessResponse(CreateMemberVoucherDTO)
	async createMemberVoucher(
		@Body() body: AssignVoucherDTO
	): Promise<CreateMemberVoucherDTO> {
		return await this.memberVoucherAdminService.createMemberVoucher(body)
	}
}

import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { Body, Controller, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { AssignVoucherDTO } from './dto/create-member-voucher.dto'
import { CreateMemberVoucherDTO } from './dto/response.dto'
import { MemberVoucherService } from './member-voucher.service'

@Controller({
	path: 'admin/member-voucher',
	version: '1',
})
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

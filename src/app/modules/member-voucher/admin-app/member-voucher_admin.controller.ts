import { difference } from 'lodash'

import { JwtAccess } from '@/app/authentication/decorators/jwt.decorator'
import { Role } from '@/common/constants'
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { Body, Controller, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { AssignVoucherDTO } from './dto/create-member-voucher.dto'
import { CreateMemberVoucherDTO } from './dto/response.dto'
import { MemberVoucherAdminService } from './member-voucher_admin.service'

@Controller({
	path: 'admin/member-voucher',
	version: '1',
})
@ApiTags('admin-app > member-voucher')
export class MemberVoucherAdminController {
	constructor(
		private readonly memberVoucherAdminService: MemberVoucherAdminService
	) {}

	@Post('create')
	@JwtAccess(Role.MEMBER) //TODO: Change to Role.ADMIN
	@ApiSuccessResponse(CreateMemberVoucherDTO)
	async createMemberVoucher(
		@Body() body: AssignVoucherDTO
	): Promise<CreateMemberVoucherDTO> {
		const createResult =
			await this.memberVoucherAdminService.createMemberVoucher(body)
		return {
			totalCount: createResult.members.length,
			successCount: createResult.newMemberVouchers.length,
			failedList: difference(
				createResult.members.map(member => member.member.toString()),
				createResult.newMemberVouchers.map(memberVoucher =>
					memberVoucher.member.toString()
				)
			),
		}
	}
}

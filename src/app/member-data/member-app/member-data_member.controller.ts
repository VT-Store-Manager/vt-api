import { CurrentUser } from '@/app/auth/decorators/current-user.decorator'
import { JwtAccess } from '@/app/auth/decorators/jwt.decorator'
import { Role } from '@/common/constants'
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { GetPointHistoryDTO } from './dto/get-point-history.dto'
import { PointHistoryResultDTO } from './dto/response.dto'
import { MemberDataMemberService } from './member-data_member.service'

@Controller({
	path: 'member-data',
	version: '1',
})
@ApiTags('member-app > member-data')
export class MemberDataMemberController {
	constructor(
		private readonly memberDataMemberService: MemberDataMemberService
	) {}

	@Get('point-history')
	@JwtAccess(Role.MEMBER)
	@ApiSuccessResponse(PointHistoryResultDTO)
	async getPointHistory(
		@CurrentUser('sub') memberId: string,
		@Query() query: GetPointHistoryDTO
	) {
		return await this.memberDataMemberService.getPointHistory(memberId, query)
	}
}

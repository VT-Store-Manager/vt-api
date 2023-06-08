import { JwtAccess } from '@/app/authentication/decorators/jwt.decorator'
import { Role } from '@/common/constants'
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { CurrentUser } from '@/app/authentication/decorators/current-user.decorator'
import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { GetPointHistoryDTO } from './dto/get-point-history.dto'
import { PointHistoryResultDTO } from './dto/response.dto'
import { MemberDataService } from './member-data.service'

@Controller({
	path: 'member-data',
	version: '1',
})
@ApiTags('member-app > member-data')
export class MemberDataController {
	constructor(private readonly memberDataService: MemberDataService) {}

	@Get('point-history')
	@JwtAccess(Role.MEMBER)
	@ApiSuccessResponse(PointHistoryResultDTO)
	async getPointHistory(
		@CurrentUser('sub') memberId: string,
		@Query() query: GetPointHistoryDTO
	) {
		return await this.memberDataService.getPointHistory(memberId, query)
	}
}

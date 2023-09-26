import { CurrentUser, JwtAccess } from '@app/authentication'
import { ApiSuccessResponse, Role } from '@app/common'
import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { GetPointHistoryDTO } from './dto/get-point-history.dto'
import { PointHistoryResultDTO } from './dto/response.dto'
import { MemberDataService } from './member-data.service'

@Controller('member-data')
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

import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { GetMemberListPaginationDTO } from './dto/get-member-list-pagination.dto'
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { MemberListPaginationDTO } from './dto/response.dto'
import { MemberService } from './member.service'

@Controller({
	version: '1',
	path: 'admin/member',
})
@ApiTags('admin-app > member')
export class MemberController {
	constructor(private readonly memberService: MemberService) {}

	@Get('list')
	@ApiSuccessResponse(MemberListPaginationDTO)
	async getListMemberPagination(@Query() query: GetMemberListPaginationDTO) {
		return await this.memberService.getListPagination(query)
	}
}

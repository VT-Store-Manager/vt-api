import { ApiSuccessResponse } from '@app/common'
import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { GetMemberListPaginationDTO } from './dto/get-member-list-pagination.dto'
import { MemberListPaginationDTO } from './dto/response.dto'
import { MemberService } from './member.service'
import { MemberDetailResponseDTO } from './dto/get-member-detail-response.dto'

@Controller('admin/member')
@ApiTags('admin-app > member')
export class MemberController {
	constructor(private readonly memberService: MemberService) {}

	@Get('list')
	@ApiSuccessResponse(MemberListPaginationDTO)
	async getListMemberPagination(@Query() query: GetMemberListPaginationDTO) {
		return await this.memberService.getListPagination(query)
	}

	@Get(':id/detail')
	@ApiSuccessResponse(MemberDetailResponseDTO)
	async getMemberDetail(@Param('id') memberId: string) {
		return await this.memberService.getMemberDetail(memberId)
	}
}

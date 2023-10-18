import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { MemberService } from './member.service'
import { JwtAccess } from '@app/authentication'
import { ApiSuccessResponse, Role } from '@app/common'
import { SearchMemberDTO } from './dto/search-member.dto'
import { SearchResultItemDTO } from './dto/response.dto'

@Controller('sale/member')
@ApiTags('sale-app > member')
export class MemberController {
	constructor(private readonly memberService: MemberService) {}

	@Get('search')
	@JwtAccess(Role.SALESPERSON)
	@ApiSuccessResponse(SearchResultItemDTO, 200, true)
	async searchMember(@Query() query: SearchMemberDTO) {
		return await this.memberService.searchMember(query)
	}
}

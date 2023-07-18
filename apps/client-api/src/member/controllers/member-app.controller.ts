import { CurrentUser, JwtAccess } from '@app/authentication'
import { ApiSuccessResponse, Role } from '@app/common'
import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { AppBarDTO } from '../dto/response.dto'
import { MemberService } from '../member.service'

@Controller({
	path: 'member/app',
	version: '1',
})
@ApiTags('member-app > app')
export class MemberAppController {
	constructor(private readonly memberService: MemberService) {}

	@Get('appbar')
	@JwtAccess(Role.MEMBER)
	@ApiSuccessResponse(AppBarDTO)
	async getAppbarData(@CurrentUser('sub') memberId: string) {
		return this.memberService.getAppBarData(memberId)
	}
}

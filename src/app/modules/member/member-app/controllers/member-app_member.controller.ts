import { JwtAccess } from '@/app/authentication/decorators/jwt.decorator'
import { Role } from '@/common/constants'
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { AppBarDTO } from '../dto/response.dto'
import { MemberService } from '../member_member.service'
import { CurrentUser } from '@/app/authentication/decorators/current-user.decorator'

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

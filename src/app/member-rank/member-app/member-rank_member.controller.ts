import { CurrentUser } from '@/app/auth/decorators/current-user.decorator'
import { JwtAccess } from '@/app/auth/decorators/jwt.decorator'
import { Role } from '@/common/constants'
import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { MemberRankMemberService } from './member_rank_member.service'

@Controller({
	path: 'member/member-rank',
	version: '1',
})
@ApiTags('member-app > member-rank')
export class MemberRankMemberController {
	constructor(
		private readonly memberRankMemberService: MemberRankMemberService
	) {}

	@Get('card')
	@JwtAccess(Role.MEMBER)
	async getMemberCard(@CurrentUser('sub') memberId: string) {
		return await this.memberRankMemberService.getMemberRankCard(memberId)
	}
}

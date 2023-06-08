import { JwtAccess } from '@/app/authentication/decorators/jwt.decorator'
import { Role } from '@/common/constants'
import { CurrentUser } from '@/app/authentication/decorators/current-user.decorator'
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

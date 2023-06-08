import { CurrentUser } from '@/app/authentication/decorators/current-user.decorator'
import { JwtAccess } from '@/app/authentication/decorators/jwt.decorator'
import { Role } from '@/common/constants'
import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { MemberRankService } from './member_rank.service'

@Controller({
	path: 'member/member-rank',
	version: '1',
})
@ApiTags('member-app > member-rank')
export class MemberRankController {
	constructor(private readonly memberRankService: MemberRankService) {}

	@Get('card')
	@JwtAccess(Role.MEMBER)
	async getMemberCard(@CurrentUser('sub') memberId: string) {
		return await this.memberRankService.getMemberRankCard(memberId)
	}
}

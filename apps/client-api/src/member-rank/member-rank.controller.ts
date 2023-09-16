import { CurrentUser, JwtAccess } from '@app/authentication'
import { Role } from '@app/common'
import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { MemberRankService } from './member_rank.service'

@Controller('member/member-rank')
@ApiTags('member-app > member-rank')
export class MemberRankController {
	constructor(private readonly memberRankService: MemberRankService) {}

	@Get('card')
	@JwtAccess(Role.MEMBER)
	async getMemberCard(@CurrentUser('sub') memberId: string) {
		return await this.memberRankService.getMemberRankCard(memberId)
	}
}

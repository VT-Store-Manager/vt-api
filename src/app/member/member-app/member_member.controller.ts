import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { MemberMemberService } from './member_member.service'

@Controller({
	path: 'member/member',
	version: '1',
})
@ApiTags('member-app > member')
export class MemberMemberController {
	constructor(private readonly memberMemberService: MemberMemberService) {}
}

import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { VoucherMemberService } from './voucher_member.service'

@Controller({
	path: 'member/voucher',
	version: '1',
})
@ApiTags('member-app > voucher')
export class VoucherMemberController {
	constructor(private readonly voucherMemberService: VoucherMemberService) {}
}

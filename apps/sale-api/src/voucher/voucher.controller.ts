import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { VoucherService } from './voucher.service'

@Controller({
	path: 'member/voucher',
	version: '1',
})
@ApiTags('member-app > voucher')
export class VoucherController {
	constructor(private readonly voucherService: VoucherService) {}
}

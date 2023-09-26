import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { VoucherService } from './voucher.service'

@Controller('member/voucher')
@ApiTags('member-app > voucher')
export class VoucherController {
	constructor(private readonly voucherService: VoucherService) {}
}

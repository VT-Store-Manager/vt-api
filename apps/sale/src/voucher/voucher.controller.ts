import { JwtAccess } from '@app/authentication'
import { ApiSuccessResponse, ObjectIdPipe, Role } from '@app/common'
import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { AvailableUserVoucherDTO } from './dto/response.dto'
import { VoucherService } from './voucher.service'

@Controller('sale/voucher')
@ApiTags('sale-app > voucher')
export class VoucherController {
	constructor(private readonly voucherService: VoucherService) {}

	@Get('available')
	@JwtAccess(Role.SALESPERSON)
	@ApiSuccessResponse(AvailableUserVoucherDTO, 200, true)
	async getAvailableVouchers(@Query('userId', ObjectIdPipe) userId: string) {
		return await this.voucherService.getUserAvailableVouchers(userId)
	}
}

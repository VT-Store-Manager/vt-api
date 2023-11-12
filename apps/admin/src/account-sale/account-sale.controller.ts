import { JwtAccess } from '@admin/authentication/decorators/jwt.decorator'
import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { AccountSaleService } from './account-sale.service'
import { ApiSuccessResponse } from '@/libs/common/src'
import { AccountSaleListPagination } from './dto/response.dto'
import { QueryAccountSaleListDTO } from './dto/query-account-sale-list.dto'

@Controller('account-sale')
@ApiTags('admin-app > account-sale')
@JwtAccess()
export class AccountSaleController {
	constructor(private readonly accountSaleService: AccountSaleService) {}

	@Get()
	@ApiSuccessResponse(AccountSaleListPagination)
	async getAccountSaleList(@Query() query: QueryAccountSaleListDTO) {
		return await this.accountSaleService.getAccountSaleList(query)
	}
}

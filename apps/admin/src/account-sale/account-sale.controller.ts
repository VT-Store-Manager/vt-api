import { CurrentAdmin } from '@admin/authentication/decorators/current-admin.decorator'
import { JwtAccess } from '@admin/authentication/decorators/jwt.decorator'
import { ApiSuccessResponse, ObjectIdPipe } from '@app/common'
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Query,
} from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'

import { AccountSaleService } from './account-sale.service'
import { CreateAccountSaleDTO } from './dto/create-account-sale.dto'
import { QueryAccountSaleListDTO } from './dto/query-account-sale-list.dto'
import {
	AccountSaleListPagination,
	NewAccountSaleDTO,
} from './dto/response.dto'
import { BooleanResponseDTO } from '@app/types'

@Controller('admin/account-sale')
@ApiTags('admin-app > account-sale')
@JwtAccess()
export class AccountSaleController {
	constructor(private readonly accountSaleService: AccountSaleService) {}

	@Get('list')
	@ApiSuccessResponse(AccountSaleListPagination)
	async getAccountSaleList(@Query() query: QueryAccountSaleListDTO) {
		return await this.accountSaleService.getAccountSaleList(query)
	}

	@Post('create')
	@ApiSuccessResponse(NewAccountSaleDTO, 201)
	async createNewAccountSale(
		@Body() body: CreateAccountSaleDTO,
		@CurrentAdmin('sub') adminId: string
	) {
		return await this.accountSaleService.createAccount(body, adminId)
	}

	@Delete(':id')
	@ApiResponse({ type: BooleanResponseDTO })
	async deleteAccount(
		@Param('id', ObjectIdPipe) deleteId: string,
		@CurrentAdmin('sub') adminId: string
	) {
		return await this.accountSaleService.deleteAccount(deleteId, adminId)
	}
}

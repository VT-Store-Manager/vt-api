import { Body, Controller, Post, Patch } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { CreateAccountAdminDTO } from '../dto/create-account-admin.dto'
import { UpdateAccountAdminDTO } from '../dto/update-account-admin.dto'
import { AccountAdminService } from '../services/account-admin.service'
import { NotEmptyObjectPipe, RemoveNullishObjectPipe } from '@/libs/common/src'

@Controller({
	path: 'account-admin',
	version: '1',
})
@ApiTags('admin-app > account-admin')
export class AccountAdminController {
	constructor(private readonly accountAdminService: AccountAdminService) {}

	@Post('create')
	async createAccountAdmin(@Body() body: CreateAccountAdminDTO) {
		return await this.accountAdminService.createAccountAdmin(body)
	}

	@Patch('update')
	async updateRole(
		@Body(RemoveNullishObjectPipe, NotEmptyObjectPipe)
		body: UpdateAccountAdminDTO
	) {
		return await this.accountAdminService.updateAccountAdmin(body)
	}
}

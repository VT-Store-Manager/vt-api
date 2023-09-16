import { CurrentAdmin } from '@admin/authentication/decorators/current-admin.decorator'
import { JwtAccess } from '@admin/authentication/decorators/jwt.decorator'
import { Body, Controller, Get, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { CreateAccountAdminRoleDTO } from '../dto/create-account-admin-role.dto'
import { AccountAdminRoleService } from '../services/account-admin-role.service'

@Controller('admin/account-admin/role')
@ApiTags('admin-app > account-admin-role')
@JwtAccess()
export class AccountAdminRoleController {
	constructor(
		private readonly accountAdminRoleService: AccountAdminRoleService
	) {}

	@Post('create')
	async createRole(
		@Body() body: CreateAccountAdminRoleDTO,
		@CurrentAdmin('sub') adminId: string
	) {
		return await this.accountAdminRoleService.addAccountRole(body, adminId)
	}

	@Get('list')
	async getRoleList() {
		return await this.accountAdminRoleService.getList()
	}
}

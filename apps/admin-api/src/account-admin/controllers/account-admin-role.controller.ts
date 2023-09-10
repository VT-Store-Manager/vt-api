import { Body, Controller, Post } from '@nestjs/common'
import { AccountAdminRoleService } from '../services/account-admin-role.service'
import { CreateAccountAdminRoleDTO } from '../dto/create-account-admin-role.dto'
import { ApiTags } from '@nestjs/swagger'

@Controller({
	path: 'account-admin/role',
	version: '1',
})
@ApiTags('admin-app > account-admin-role')
export class AccountAdminRoleController {
	constructor(
		private readonly accountAdminRoleService: AccountAdminRoleService
	) {}

	@Post('create')
	async createRole(@Body() body: CreateAccountAdminRoleDTO) {
		return await this.accountAdminRoleService.addAccountRole(
			body,
			'64fdcb0edd78f61cafd4c005'
		)
	}
}

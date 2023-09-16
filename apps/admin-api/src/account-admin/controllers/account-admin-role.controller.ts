import { Body, Controller, Post } from '@nestjs/common'
import { AccountAdminRoleService } from '../services/account-admin-role.service'
import { CreateAccountAdminRoleDTO } from '../dto/create-account-admin-role.dto'
import { ApiTags } from '@nestjs/swagger'
import { JwtAccess } from '@/libs/authentication/src'
import { CurrentAdmin } from '@/apps/admin-api/authentication/decorators/current-admin.decorator'

@Controller('account-admin/role')
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
}

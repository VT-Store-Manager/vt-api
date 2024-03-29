import { CurrentAdmin } from '@admin/authentication/decorators/current-admin.decorator'
import { JwtAccess } from '@admin/authentication/decorators/jwt.decorator'
import { ObjectIdPipe } from '@app/common'
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Put,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { CreateAccountAdminRoleDTO } from '../dto/create-account-admin-role.dto'
import { UpdateRoleDTO } from '../dto/update-role.dto'
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

	@Get('permission')
	getPermissionList() {
		return this.accountAdminRoleService.getRolePermissions()
	}

	@Put('update')
	async updateRole(
		@CurrentAdmin('sub') adminId: string,
		@Body() body: UpdateRoleDTO
	) {
		return await this.accountAdminRoleService.updateRole(adminId, body)
	}

	@Delete(':id/disable')
	async disableRole(
		@CurrentAdmin('sub') adminId: string,
		@Param('id', ObjectIdPipe) roleId: string
	) {
		return await this.accountAdminRoleService.disableRole(adminId, roleId)
	}

	@Patch(':id/restore')
	async restoreRole(@Param('id', ObjectIdPipe) roleId: string) {
		return await this.accountAdminRoleService.restoreRole(roleId)
	}
}

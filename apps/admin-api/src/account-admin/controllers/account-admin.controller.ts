import { Body, Controller, Post, Patch, Delete } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { CreateAccountAdminDTO } from '../dto/create-account-admin.dto'
import { UpdateAccountAdminDTO } from '../dto/update-account-admin.dto'
import { AccountAdminService } from '../services/account-admin.service'
import {
	NotEmptyObjectPipe,
	ObjectIdPipe,
	RemoveNullishObjectPipe,
} from '@/libs/common/src'
import { JwtAccess } from '@/libs/authentication/src'
import { CurrentAdmin } from '@/apps/admin-api/authentication/decorators/current-admin.decorator'
import { UpdateAccountAdminPasswordDTO } from '../dto/update-account-admin-password.dto'
import { UpdateAccountRoleDTO } from '../dto/update-account-role.dto'

@Controller('account-admin')
@ApiTags('admin-app > account-admin')
@JwtAccess()
export class AccountAdminController {
	constructor(private readonly accountAdminService: AccountAdminService) {}

	@Post('create')
	async createAccountAdmin(@Body() body: CreateAccountAdminDTO) {
		return await this.accountAdminService.createAccountAdmin(body)
	}

	@Patch('update-info')
	async updateInfo(
		@Body(RemoveNullishObjectPipe, NotEmptyObjectPipe)
		body: UpdateAccountAdminDTO,
		@CurrentAdmin('sub') adminId: string
	) {
		return await this.accountAdminService.updateAccountAdmin(adminId, body)
	}

	@Patch('update-password')
	async updatePassword(
		@Body() body: UpdateAccountAdminPasswordDTO,
		@CurrentAdmin('sub') adminId: string
	) {
		return await this.accountAdminService.updateAccountPassword(adminId, body)
	}

	@Patch('update-role')
	async updateRole(
		@Body() body: UpdateAccountRoleDTO,
		@CurrentAdmin('sub') adminId: string
	) {
		return await this.accountAdminService.updateAccountRole(adminId, body)
	}

	@Delete('disable')
	async disableAccount(
		@Body('id', ObjectIdPipe) id: string,
		@CurrentAdmin('sub') adminId: string
	) {
		return await this.accountAdminService.disableAccount(id, adminId)
	}
}

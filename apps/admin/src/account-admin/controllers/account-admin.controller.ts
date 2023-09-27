import {
	NotEmptyObjectPipe,
	ObjectIdPipe,
	RemoveNullishObjectPipe,
} from '@/libs/common/src'
import { CurrentAdmin } from '@admin/authentication/decorators/current-admin.decorator'
import { JwtAccess } from '@admin/authentication/decorators/jwt.decorator'
import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { CreateAccountAdminDTO } from '../dto/create-account-admin.dto'
import { UpdateAccountAdminPasswordDTO } from '../dto/update-account-admin-password.dto'
import { UpdateAccountAdminDTO } from '../dto/update-account-admin.dto'
import { UpdateAccountRoleDTO } from '../dto/update-account-role.dto'
import { AccountAdminService } from '../services/account-admin.service'
import { CheckPolicies } from '@admin/authentication/decorators/check-policies.decorator'
import { AdminAbility } from '../../casl/casl-ability.factory'
import { AdminFeature, Actions } from '@admin/constants'

@Controller('admin/account-admin')
@ApiTags('admin-app > account-admin')
@JwtAccess()
export class AccountAdminController {
	constructor(private readonly accountAdminService: AccountAdminService) {}

	@Post('create')
	@CheckPolicies((ability: AdminAbility) =>
		ability.can(Actions.UPDATE, AdminFeature.ACCOUNT)
	)
	async createAccountAdmin(@Body() body: CreateAccountAdminDTO) {
		return await this.accountAdminService.createAccountAdmin(body)
	}

	@Get('list')
	@CheckPolicies((ability: AdminAbility) => {
		return ability.can(Actions.VIEW, AdminFeature.ACCOUNT)
	})
	async getAccountAdminList() {
		return await this.accountAdminService.getList()
	}

	@Patch('update-info')
	@CheckPolicies((ability: AdminAbility) =>
		ability.can(Actions.UPDATE, AdminFeature.ACCOUNT)
	)
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

	@Patch('reset-password')
	async resetPassword(
		@Body('accountId', ObjectIdPipe) targetId: string,
		@CurrentAdmin('sub') adminId: string
	) {
		return await this.accountAdminService.resetAccountPassword(
			adminId,
			targetId
		)
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

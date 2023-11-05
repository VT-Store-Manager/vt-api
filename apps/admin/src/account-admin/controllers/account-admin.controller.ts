import { CheckPolicies } from '@admin/authentication/decorators/check-policies.decorator'
import { CurrentAdmin } from '@admin/authentication/decorators/current-admin.decorator'
import { JwtAccess } from '@admin/authentication/decorators/jwt.decorator'
import { Actions, AdminFeature } from '@admin/constants'
import {
	NotEmptyObjectPipe,
	ObjectIdPipe,
	RemoveNullishObjectPipe,
} from '@app/common'
import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import {
	AdminAbility,
	CaslAbilityFactory,
} from '../../casl/casl-ability.factory'
import { CreateAccountAdminDTO } from '../dto/create-account-admin.dto'
import { UpdateAccountAdminPasswordDTO } from '../dto/update-account-admin-password.dto'
import { UpdateAccountAdminDTO } from '../dto/update-account-admin.dto'
import { UpdateAccountRoleDTO } from '../dto/update-account-role.dto'
import { AccountAdminService } from '../services/account-admin.service'

@Controller('admin/account-admin')
@ApiTags('admin-app > account-admin')
@JwtAccess()
export class AccountAdminController {
	constructor(
		private readonly accountAdminService: AccountAdminService,
		private readonly caslAbilityFactory: CaslAbilityFactory
	) {}

	@Post('create')
	@CheckPolicies((ability: AdminAbility) =>
		ability.can(Actions.MODIFY, AdminFeature.ACCOUNT)
	)
	async createAccountAdmin(@Body() body: CreateAccountAdminDTO) {
		return await this.accountAdminService.createAccountAdmin(body)
	}

	@Get('list')
	@CheckPolicies((ability: AdminAbility) => {
		return ability.can(Actions.READ, AdminFeature.ACCOUNT)
	})
	async getAccountAdminList() {
		return await this.accountAdminService.getList()
	}

	@Get('ability')
	async getAbility(@CurrentAdmin('sub') adminId: string) {
		return await this.caslAbilityFactory.getAbilitiesOfAdmin(adminId)
	}

	@Patch('update-info')
	@CheckPolicies((ability: AdminAbility) =>
		ability.can(Actions.MODIFY, AdminFeature.ACCOUNT)
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

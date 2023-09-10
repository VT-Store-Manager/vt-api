import { Controller } from '@nestjs/common'
import { AccountAdminPermissionService } from '../services/account-admin-permission.service'
import { ApiTags } from '@nestjs/swagger'

@Controller({
	path: 'account-admin/permission',
	version: '1',
})
@ApiTags('admin-app > account-admin-permission')
export class AccountAdminPermissionController {
	constructor(
		private readonly accountAdminPermissionService: AccountAdminPermissionService
	) {}
}

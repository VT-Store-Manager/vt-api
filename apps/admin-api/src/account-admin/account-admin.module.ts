import {
	AccountAdmin,
	AccountAdminPermission,
	AccountAdminPermissionSchema,
	AccountAdminRole,
	AccountAdminRoleSchema,
	AccountAdminSchema,
	Store,
	StoreSchema,
} from '@app/database'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AccountAdminPermissionController } from './controllers/account-admin-permission.controller'
import { AccountAdminPermissionService } from './services/account-admin-permission.service'
import { AccountAdminController } from './controllers/account-admin.controller'
import { AccountAdminService } from './services/account-admin.service'
import { AccountAdminRoleController } from './controllers/account-admin-role.controller'
import { AccountAdminRoleService } from './services/account-admin-role.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: AccountAdmin.name, schema: AccountAdminSchema },
			{ name: AccountAdminRole.name, schema: AccountAdminRoleSchema },
			{
				name: AccountAdminPermission.name,
				schema: AccountAdminPermissionSchema,
			},
			{ name: Store.name, schema: StoreSchema },
		]),
	],
	controllers: [
		AccountAdminPermissionController,
		AccountAdminRoleController,
		AccountAdminController,
	],
	providers: [
		AccountAdminPermissionService,
		AccountAdminRoleService,
		AccountAdminService,
	],
})
export class AccountAdminModule {}

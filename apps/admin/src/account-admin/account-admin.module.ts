import {
	AccountAdmin,
	AccountAdminRole,
	AccountAdminRoleSchema,
	AccountAdminSchema,
	Store,
	StoreSchema,
} from '@app/database'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AccountAdminController } from './controllers/account-admin.controller'
import { AccountAdminService } from './services/account-admin.service'
import { AccountAdminRoleController } from './controllers/account-admin-role.controller'
import { AccountAdminRoleService } from './services/account-admin-role.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: AccountAdmin.name, schema: AccountAdminSchema },
			{ name: AccountAdminRole.name, schema: AccountAdminRoleSchema },
			{ name: Store.name, schema: StoreSchema },
		]),
	],
	controllers: [AccountAdminRoleController, AccountAdminController],
	providers: [AccountAdminRoleService, AccountAdminService],
})
export class AccountAdminModule {}

import {
	AccountAdmin,
	AccountAdminDocument,
	AccountAdminRole,
	AccountAdminRoleDocument,
} from '@app/database'
import { BadGatewayException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CreateAccountAdminRoleDTO } from '../dto/create-account-admin-role.dto'

@Injectable()
export class AccountAdminRoleService {
	constructor(
		@InjectModel(AccountAdminRole.name)
		private readonly accountAdminRoleModel: Model<AccountAdminRoleDocument>,
		@InjectModel(AccountAdmin.name)
		private readonly accountAdminModel: Model<AccountAdminDocument>
	) {}

	async addAccountRole(data: CreateAccountAdminRoleDTO, adminId: string) {
		const adminData = await this.accountAdminModel
			.findById(adminId)
			.orFail(new BadGatewayException('Admin account not found'))
			.select('username')
			.lean()
			.exec()

		const createdPermission = await this.accountAdminRoleModel.create({
			name: data.name,
			items: data.permissions,
			updatedBy: {
				accountId: adminId,
				accountUsername: adminData.username,
				time: new Date(),
			},
		})

		return createdPermission
	}
}

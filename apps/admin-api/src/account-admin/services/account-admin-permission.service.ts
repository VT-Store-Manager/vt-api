import {
	AccountAdmin,
	AccountAdminDocument,
	AccountAdminPermission,
	AccountAdminPermissionDocument,
} from '@app/database'
import { BadGatewayException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CreateAccountAdminPermissionDTO } from '../dto/create-account-admin-permission.dto'

@Injectable()
export class AccountAdminPermissionService {
	constructor(
		@InjectModel(AccountAdminPermission.name)
		private readonly accountAdminPermissionModel: Model<AccountAdminPermissionDocument>,
		@InjectModel(AccountAdmin.name)
		private readonly accountAdminModel: Model<AccountAdminDocument>
	) {}

	async addPermission(
		data: CreateAccountAdminPermissionDTO,
		adminId: string
	): Promise<AccountAdminPermission> {
		const adminData = await this.accountAdminModel
			.findById(adminId)
			.orFail(new BadGatewayException('Admin account not found'))
			.select('username')
			.lean()
			.exec()

		const createdPermission = await this.accountAdminPermissionModel.create({
			name: data.name,
			items: data.items.map(itemName => ({ name: itemName })),
			updatedBy: {
				accountId: adminId,
				accountUsername: adminData.username,
				time: new Date(),
			},
		})

		return createdPermission
	}
}

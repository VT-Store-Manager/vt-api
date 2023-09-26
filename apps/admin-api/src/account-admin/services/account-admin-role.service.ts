import { Model, Types } from 'mongoose'

import { AdminFeature, AdminFeaturePermission } from '@admin/constants'
import {
	AccountAdmin,
	AccountAdminDocument,
	AccountAdminRole,
	AccountAdminRoleDocument,
} from '@app/database'
import {
	BadGatewayException,
	BadRequestException,
	Injectable,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { CreateAccountAdminRoleDTO } from '../dto/create-account-admin-role.dto'
import { UpdateRoleDTO } from '../dto/update-role.dto'
import { SoftDeleteModel } from 'mongoose-delete'
import { UpdateResult } from 'mongodb'

@Injectable()
export class AccountAdminRoleService {
	constructor(
		@InjectModel(AccountAdminRole.name)
		private readonly accountAdminRoleModel: SoftDeleteModel<AccountAdminRoleDocument>,
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
			permissions: data.permissions,
			updatedBy: {
				accountId: adminId,
				accountUsername: adminData.username,
				time: new Date(),
			},
		})

		return createdPermission
	}

	async getList() {
		return await this.accountAdminRoleModel
			.aggregate([
				{
					$addFields: {
						id: { $toString: '$_id' },
					},
				},
				{
					$project: {
						_id: false,
					},
				},
			])
			.exec()
	}

	getRolePermissions() {
		return {
			nameKeys: Object.values(AdminFeature),
			permissionKeys: Object.values(AdminFeaturePermission),
		}
	}

	async updateRole(adminId: string, data: UpdateRoleDTO) {
		const accountAdmin = await this.accountAdminModel
			.findById(adminId)
			.orFail(new BadRequestException('Admin not found'))
			.lean()
			.exec()

		const updateData: AccountAdminRole = {
			name: data.name,
			permissions: data.permissions.map(p => {
				return {
					featureName: p.featureName,
					scopes: p.scopes,
				}
			}),
			updatedBy: {
				accountId: accountAdmin._id,
				accountUsername: accountAdmin.username,
				time: new Date(),
			},
		}

		const updateResult = await this.accountAdminRoleModel
			.updateOne({ _id: new Types.ObjectId(data.id) }, { $set: updateData })
			.exec()

		return updateResult.matchedCount > 0
	}

	async disableRole(adminId: string, roleId: string) {
		const deleteResult: UpdateResult = (await this.accountAdminRoleModel
			.deleteById(roleId, adminId)
			.exec()) as any

		return !!deleteResult.modifiedCount
	}

	async restoreRole(roleId: string) {
		const updateResult = await this.accountAdminRoleModel.restore({
			_id: new Types.ObjectId(roleId),
		})

		return !!updateResult.modifiedCount
	}
}

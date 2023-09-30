import difference from 'lodash/difference'
import uniq from 'lodash/uniq'
import { Model, Types } from 'mongoose'
import { SoftDeleteModel } from 'mongoose-delete'

import { adminPasswordUid, compare, hash } from '@app/common'
import {
	AccountAdmin,
	AccountAdminDocument,
	AccountAdminRole,
	AccountAdminRoleDocument,
	Store,
	StoreDocument,
} from '@app/database'
import {
	BadRequestException,
	ForbiddenException,
	Injectable,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { CreateAccountAdminDTO } from '../dto/create-account-admin.dto'
import { UpdateAccountAdminPasswordDTO } from '../dto/update-account-admin-password.dto'
import { UpdateAccountAdminDTO } from '../dto/update-account-admin.dto'
import { UpdateAccountRoleDTO } from '../dto/update-account-role.dto'

@Injectable()
export class AccountAdminService {
	constructor(
		@InjectModel(AccountAdmin.name)
		private readonly accountAdminModel: SoftDeleteModel<AccountAdminDocument>,
		@InjectModel(AccountAdminRole.name)
		private readonly accountAdminRoleModel: Model<AccountAdminRoleDocument>,
		@InjectModel(Store.name)
		private readonly storeModel: Model<StoreDocument>
	) {}

	private async isExistAccount(
		uniqData: { id?: string; username?: string } = {}
	) {
		const countAccount = await this.accountAdminModel
			.countDocuments({
				$or: [
					{ _id: new Types.ObjectId(uniqData.id) },
					{ username: uniqData.username },
				],
			})
			.exec()
		return countAccount > 0
	}

	async createAccountAdmin(data: CreateAccountAdminDTO) {
		const createdAccount = await this.accountAdminModel.create({
			username: data.username,
			name: data.name,
			password: adminPasswordUid(),
			role: data.role,
			stores: data.stores,
		})
		return createdAccount
	}

	async getList() {
		const accounts = await this.accountAdminModel
			.aggregate([
				{
					$project: {
						id: {
							$toString: '$_id',
						},
						_id: false,
						username: true,
						name: true,
						roles: true,
						stores: true,
						createdAt: true,
						updatedAt: true,
					},
				},
			])
			.exec()

		return accounts
	}

	async updateAccountAdmin(adminId: string, data: UpdateAccountAdminDTO) {
		if (!(await this.isExistAccount({ id: adminId }))) {
			throw new BadRequestException('Account not found')
		}

		const updateData: Partial<AccountAdmin> = {}
		if (data.username) {
			if (await this.isExistAccount({ username: data.username })) {
				throw new BadRequestException('Username is existed')
			}
			updateData.username = data.username
		}

		const updateResult = await this.accountAdminModel
			.updateOne({ _id: new Types.ObjectId(adminId) }, updateData)
			.exec()

		return updateResult.matchedCount === 1
	}

	async updateAccountPassword(id: string, data: UpdateAccountAdminPasswordDTO) {
		const { password } = await this.accountAdminModel
			.findById(id)
			.orFail(new ForbiddenException('Admin account not found'))
			.select('password')
			.lean()
			.exec()

		if (!compare(data.oldPassword, password)) {
			throw new BadRequestException('Old password is incorrect')
		}

		const updateResult = await this.accountAdminModel
			.updateOne(
				{ _id: new Types.ObjectId(id) },
				{
					$set: {
						password: hash(data.newPassword),
					},
				}
			)
			.exec()

		return updateResult.modifiedCount > 0
	}

	async resetAccountPassword(_adminId: string, _targetId) {
		throw new BadRequestException()
	}

	async updateAccountRole(id: string, data: UpdateAccountRoleDTO) {
		const updateData: Partial<Pick<AccountAdmin, 'roles' | 'stores'>> = {}

		data.roles = uniq(data.roles)
		const roles = (
			await this.accountAdminRoleModel
				.aggregate<{ id: string }>([
					{
						$match: {
							_id: {
								$in: data.roles.map(roleId => new Types.ObjectId(roleId)),
							},
						},
					},
					{
						$project: {
							id: { $toString: '$_id' },
						},
					},
				])
				.exec()
		).map(role => role.id)
		const wrongRoles = difference(data.roles, roles)
		if (wrongRoles.length > 0) {
			throw new BadRequestException(
				`Role${wrongRoles.length > 1 ? 's' : ''} ${wrongRoles.join(
					', '
				)} not found`
			)
		}
		updateData.roles = roles.map(role => new Types.ObjectId(role))

		if (data.stores) {
			data.stores = uniq(data.stores)
			const stores = (
				await this.storeModel
					.aggregate<{ id: string }>([
						{
							$match: {
								_id: {
									$in: data.stores.map(storeId => new Types.ObjectId(storeId)),
								},
							},
						},
						{
							$project: {
								id: { $toString: '$_id' },
							},
						},
					])
					.exec()
			).map(store => store.id)
			const wrongStores = difference(data.stores, stores)

			if (wrongStores.length > 0) {
				throw new BadRequestException(
					`Store${wrongStores.length > 1 ? 's' : ''} ${wrongStores.join(
						', '
					)} not found`
				)
			}
			updateData.stores = stores.map(store => new Types.ObjectId(store))
		}

		const updateResult = await this.accountAdminModel
			.updateOne(
				{ _id: new Types.ObjectId(id) },
				{
					$set: {
						...updateData,
					},
				}
			)
			.exec()

		return updateResult
	}

	async disableAccount(targetId: string, accountId: string) {
		const disableResult = await this.accountAdminModel
			.deleteById(targetId, accountId)
			.orFail(new BadRequestException('Target admin cannot found'))
			.exec()

		return disableResult.deletedCount
	}
}

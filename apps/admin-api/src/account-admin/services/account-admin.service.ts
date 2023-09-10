import { Model, Types } from 'mongoose'

import { adminPasswordUid, hash } from '@app/common'
import {
	AccountAdmin,
	AccountAdminDocument,
	AccountAdminRole,
	AccountAdminRoleDocument,
	Store,
	StoreDocument,
} from '@app/database'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { CreateAccountAdminDTO } from '../dto/create-account-admin.dto'
import { UpdateAccountAdminDTO } from '../dto/update-account-admin.dto'

@Injectable()
export class AccountAdminService {
	constructor(
		@InjectModel(AccountAdmin.name)
		private readonly accountAdminModel: Model<AccountAdminDocument>,
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

	private async getExistRoleIds(roles: string[]) {
		const roleIds = roles.map(role => new Types.ObjectId(role))

		const roleDocuments = await this.accountAdminRoleModel
			.aggregate<{ _id: Types.ObjectId }>([
				{
					$match: {
						_id: { $in: roleIds },
					},
				},
				{
					$project: {
						_id: true,
					},
				},
			])
			.exec()
		return roleDocuments.map(doc => doc._id)
	}

	private async getStoreIds(stores: string[]) {
		const storeIds = stores.map(store => new Types.ObjectId(store))

		const storeDocuments = await this.storeModel
			.aggregate<{ _id: Types.ObjectId }>([
				{
					$match: {
						_id: { $in: storeIds },
					},
				},
				{
					$project: {
						_id: true,
					},
				},
			])
			.exec()

		return storeDocuments.map(doc => doc._id)
	}

	async createAccountAdmin(data: CreateAccountAdminDTO) {
		const createdAccount = await this.accountAdminModel.create({
			username: data.username,
			password: adminPasswordUid(),
			role: data.role,
			stores: data.stores,
		})
		return createdAccount
	}

	async updateAccountAdmin(data: UpdateAccountAdminDTO) {
		if (!(await this.isExistAccount({ id: data.id }))) {
			throw new BadRequestException('Account not found')
		}

		const updateData: Partial<AccountAdmin> = {}
		if (data.username) {
			if (await this.isExistAccount({ username: data.username })) {
				throw new BadRequestException('Username is existed')
			}
			updateData.username = data.username
		}
		if (data.password) {
			updateData.password = hash(data.password)
		}
		if (data.role) {
			const roleIds = await this.getExistRoleIds(data.role)
			if (roleIds.length === 0) {
				throw new BadRequestException('Roles is empty or not existed')
			}
			updateData.role = roleIds
		}
		if (data.stores) {
			updateData.stores = await this.getStoreIds(data.stores)
		}

		const updateResult = await this.accountAdminModel
			.updateOne({ _id: new Types.ObjectId(data.id) }, updateData)
			.exec()

		return updateResult.matchedCount === 1
	}
}

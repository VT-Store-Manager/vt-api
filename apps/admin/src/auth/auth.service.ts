import { Model, Types } from 'mongoose'

import {
	AccountAdmin,
	AccountAdminDocument,
	AccountAdminRole,
	AccountAdminRoleDocument,
} from '@app/database'
import {
	BadRequestException,
	ForbiddenException,
	Injectable,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { LoginAdminDTO } from './dto/login.dto'
import { compare, hash } from '@app/common'
import { UpdatePasswordDTO } from './dto/update-password.dto'

@Injectable()
export class AuthService {
	constructor(
		@InjectModel(AccountAdmin.name)
		private readonly accountAdminModel: Model<AccountAdminDocument>,
		@InjectModel(AccountAdminRole.name)
		private readonly accountAdminRoleModel: Model<AccountAdminRoleDocument>
	) {}

	async loginAdmin(data: LoginAdminDTO) {
		const wrongLogin = new BadRequestException(
			'Username or password is incorrect'
		)

		const [account] = await this.accountAdminModel
			.aggregate<Omit<AccountAdmin, 'roles'> & { roles: AccountAdminRole[] }>([
				{ $match: { username: data.username } },
				{
					$lookup: {
						from: 'account_admin_roles',
						localField: 'roles',
						foreignField: '_id',
						as: 'roles',
						pipeline: [
							{
								$project: {
									_id: true,
									name: true,
								},
							},
						],
					},
				},
			])
			.exec()

		if (
			!account ||
			(account.forceUpdatePassword && data.password !== account.password) ||
			!(account.forceUpdatePassword || compare(data.password, account.password))
		) {
			throw wrongLogin
		}

		return account
	}

	async getAccountAdmin(id: string) {
		return await this.accountAdminModel
			.findById(id)
			.orFail(new ForbiddenException('Admin not found'))
			.select('-password')
			.lean()
			.exec()
	}

	async updateTokenValidTime(id: string) {
		const updateResult = await this.accountAdminModel
			.updateOne(
				{ _id: new Types.ObjectId(id) },
				{
					tokenValidTime: new Date(),
				}
			)
			.exec()
		return updateResult.modifiedCount > 0
	}

	async updatePassword(adminId: string, data: UpdatePasswordDTO) {
		const adminData = await this.accountAdminModel
			.findOne(
				{ _id: new Types.ObjectId(adminId) },
				{
					password: true,
					forceUpdatePassword: true,
				}
			)
			.orFail(new BadRequestException('Không tìm thấy admin này'))
			.lean()
			.exec()

		if (
			!compare(data.oldPassword, adminData.password) &&
			adminData.forceUpdatePassword &&
			data.oldPassword !== adminData.password
		) {
			throw new BadRequestException('Mật khẩu không chính xác')
		}

		const updateResult = await this.accountAdminModel
			.updateOne(
				{ _id: new Types.ObjectId(adminId) },
				{
					$set: {
						password: hash(data.newPassword),
						forceUpdatePassword: false,
					},
				}
			)
			.exec()
		return updateResult.matchedCount > 0
	}
}

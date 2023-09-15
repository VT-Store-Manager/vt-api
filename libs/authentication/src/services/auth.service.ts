import { ClientSession, Model, Types } from 'mongoose'

import {
	AccountAdmin,
	AccountAdminDocument,
	Member,
	MemberDocument,
	Store,
	StoreDocument,
} from '@app/database'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

@Injectable()
export class AuthService {
	constructor(
		@InjectModel(Member.name)
		private readonly memberModel: Model<MemberDocument>,
		@InjectModel(Store.name) private readonly storeModel: Model<StoreDocument>,
		@InjectModel(AccountAdmin.name)
		private readonly accountAdminModel: Model<AccountAdminDocument>
	) {}

	async updateTokenValidTime(uid: string, session?: ClientSession) {
		const updateResult = await this.memberModel.updateOne(
			{ _id: new Types.ObjectId(uid) },
			{
				tokenValidTime: new Date(),
			},
			session ? { session } : {}
		)
		return updateResult
	}

	async getTokenValidTimeMember(id: string) {
		const member = await this.memberModel
			.findById(id)
			.orFail(new UnauthorizedException('User not found'))
			.select('tokenValidTime')
			.lean()
			.exec()
		return member.tokenValidTime
	}

	async checkStoreExist(id: string) {
		const countStore = await this.storeModel
			.count({ _id: new Types.ObjectId(id) })
			.exec()
		return countStore > 0
	}

	async getTokenValidTimeAdmin(id: string) {
		const member = await this.accountAdminModel
			.findById(id)
			.orFail(new UnauthorizedException('User not found'))
			.select('tokenValidTime')
			.lean()
			.exec()
		return member.tokenValidTime
	}
}

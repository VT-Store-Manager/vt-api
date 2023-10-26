import { ClientSession, Model, Types } from 'mongoose'

import {
	AccountAdmin,
	AccountAdminDocument,
	Member,
	MemberDocument,
	Shipper,
	ShipperDocument,
	Store,
	StoreDocument,
} from '@app/database'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { SoftDeleteModel } from 'mongoose-delete'

@Injectable()
export class AuthService {
	constructor(
		@InjectModel(Member.name)
		private readonly memberModel: SoftDeleteModel<MemberDocument>,
		@InjectModel(Store.name) private readonly storeModel: Model<StoreDocument>,
		@InjectModel(AccountAdmin.name)
		private readonly accountAdminModel: Model<AccountAdminDocument>,
		@InjectModel(Shipper.name)
		private readonly shipperModel: SoftDeleteModel<ShipperDocument>
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
			.findOne({ _id: new Types.ObjectId(id) })
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

	async checkShipperExist(id: string) {
		const countShipper = await this.shipperModel
			.count({ _id: new Types.ObjectId(id) })
			.exec()

		return countShipper > 0
	}
}

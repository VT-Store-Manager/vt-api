import { ClientSession, Model, Types } from 'mongoose'

import { Member, MemberDocument } from '@app/database'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

@Injectable()
export class AuthService {
	constructor(
		@InjectModel(Member.name)
		private readonly memberModel: Model<MemberDocument>
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
}

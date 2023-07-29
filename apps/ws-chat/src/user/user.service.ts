import { Member, MemberDocument } from '@app/database'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

@Injectable()
export class UserService {
	constructor(
		@InjectModel(Member.name)
		private readonly memberModel: Model<MemberDocument>
	) {}

	async getUserInfo(phone: string) {
		const member = await this.memberModel
			.findOne({ $or: [{ phone }, { phone: phone.replace(/^0/, '+84') }] })
			.orFail(new BadRequestException('Member not found'))
			.select({
				firstName: true,
				lastName: true,
			})
			.lean()
			.exec()
		return {
			id: member._id.toString(),
			name: `${member.firstName} ${member.lastName}`,
		}
	}

	async getUserById(id: string) {
		const member = await this.memberModel
			.findById(id)
			.select({
				firstName: true,
				lastName: true,
			})
			.lean()
			.exec()
		if (!member) return null
		return {
			id: member._id.toString(),
			name: `${member.firstName} ${member.lastName}`,
		}
	}

	async getAllUsers() {
		return await this.memberModel
			.aggregate<{
				id: string
				name: string
			}>([
				{
					$project: {
						id: { $toString: '$_id' },
						_id: false,
						name: { $concat: ['$firstName', ' ', '$lastName'] },
					},
				},
			])
			.exec()
	}
}

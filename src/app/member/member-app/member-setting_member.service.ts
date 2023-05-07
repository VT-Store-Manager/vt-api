import { Model, Types } from 'mongoose'

import { Member, MemberDocument } from '@/schemas/member.schema'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { UpdateProfileDTO } from './dto/update-profile.dto'

@Injectable()
export class MemberSettingService {
	constructor(
		@InjectModel(Member.name)
		private readonly memberModel: Model<MemberDocument>
	) {}

	async getProfile(memberId: string) {
		const memberData = await this.memberModel
			.findById(memberId)
			.orFail(new BadRequestException('Member not found'))
			.select('-_id firstName lastName dob gender phone')
			.lean()
			.exec()
		return memberData
	}

	async updateProfile(memberId: string, data: UpdateProfileDTO) {
		const updateResult = await this.memberModel
			.updateOne(
				{
					_id: new Types.ObjectId(memberId),
				},
				{
					...data,
				}
			)
			.orFail(new BadRequestException('Member not found'))
			.exec()

		return updateResult.matchedCount === 1
	}
}

import { ClientSession, Model } from 'mongoose'

import { Member, MemberDocument } from '@/schemas/member.schema'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { RegisterMemberDto } from '../dto/register-member.dto'

@Injectable()
export class AuthMemberService {
	constructor(
		@InjectModel(Member.name)
		private readonly memberModel: Model<MemberDocument>
	) {}

	async createTemporaryMember(dto: RegisterMemberDto, session?: ClientSession) {
		const member = await this.memberModel.create(
			[
				{
					mobile: dto.mobile,
					firstName: dto.firstName,
					lastName: dto.lastName,
					gender: dto.gender,
					dob: new Date(dto.dob),
				},
			],
			session ? { session } : {}
		)
		return member[0]
	}
}

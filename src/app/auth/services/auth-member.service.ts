import { ClientSession, Model } from 'mongoose'

import { Member, MemberDocument } from '@/schemas/member.schema'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { RegisterMemberDTO } from '../dto/register-member.dto'
import { UserRole } from '@/common/constants'

@Injectable()
export class AuthMemberService {
	constructor(
		@InjectModel(Member.name)
		private readonly memberModel: Model<MemberDocument>
	) {}

	async createTemporaryMember(dto: RegisterMemberDTO, session?: ClientSession) {
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

	async checkAccount(mobile: string) {
		const member = await this.memberModel
			.findOne({ mobile })
			.orFail(new BadRequestException('The account does not exist'))
			.select('deleted')
			.lean()
			.exec()
		if (member.deleted)
			throw new BadRequestException('The account have already deleted')
		return !!member
	}

	async getJwtPayload(mobile: string) {
		const member = await this.memberModel
			.findOneAndUpdate(
				{ mobile },
				{ $unset: { notVerified: 0 }, $set: { tokenValidTime: new Date() } }
			)
			.orFail(new BadRequestException('Account not found'))
			.select('firstName lastName gender dob')
			.lean()
			.exec()
		return {
			id: member._id.toString(),
			role: UserRole.MEMBER,
			firstName: member.firstName,
			lastName: member.lastName,
			gender: member.gender,
			dob: member.dob,
		}
	}
}

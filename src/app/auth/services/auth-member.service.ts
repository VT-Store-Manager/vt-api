import { ClientSession, Model } from 'mongoose'

import { Member, MemberDocument } from '@/schemas/member.schema'
import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { RegisterMemberDTO } from '../dto/register-member.dto'
import { Types } from 'mongoose'

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

	async getJwtPayloadByMobile(mobile: string, session?: ClientSession) {
		const member = await this.memberModel
			.findOneAndUpdate(
				{ mobile },
				{ $unset: { notVerified: 0 } },
				session ? { session } : {}
			)
			.orFail(new BadRequestException('Account not found'))
			.select('firstName lastName')
			.lean()
			.exec()
		return member
	}

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

	async getTokenValidTime(id: string) {
		const member = await this.memberModel
			.findById(id)
			.orFail(new UnauthorizedException('User not found'))
			.select('tokenValidTime')
			.lean()
			.exec()
		return member.tokenValidTime
	}

	async getJwtPayload(uid: string) {
		const member = await this.memberModel
			.findById(uid)
			.orFail(new UnauthorizedException('User not found'))
			.lean()
			.exec()
		return member
	}
}

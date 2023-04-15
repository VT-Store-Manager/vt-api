import { ClientSession, Model, Types } from 'mongoose'

import { MemberData, MemberDataDocument } from '@/schemas/member-data.schema'
import { MemberRank, MemberRankDocument } from '@/schemas/member-rank.schema'
import { Member, MemberDocument } from '@/schemas/member.schema'
import { Rank, RankDocument } from '@/schemas/rank.schema'
import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { RegisterMemberDTO } from '../dto/register-member.dto'

@Injectable()
export class AuthMemberService {
	constructor(
		@InjectModel(Member.name)
		private readonly memberModel: Model<MemberDocument>,
		@InjectModel(Rank.name)
		private readonly rankModel: Model<RankDocument>,
		@InjectModel(MemberData.name)
		private readonly memberDataModel: Model<MemberDataDocument>,
		@InjectModel(MemberRank.name)
		private readonly memberRankModel: Model<MemberRankDocument>
	) {}

	async createTemporaryMember(dto: RegisterMemberDTO, session?: ClientSession) {
		const member = await this.memberModel.create(
			[
				{
					phone: dto.phone,
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

	async checkAccount(phone: string) {
		const member = await this.memberModel
			.findOne({ phone })
			.orFail(new BadRequestException('The account does not exist'))
			.select('deleted')
			.lean()
			.exec()
		if (member.deleted)
			throw new BadRequestException('The account have already deleted')
		return !!member
	}

	async initMemberData(
		phone: string,
		session?: ClientSession
	): Promise<string> {
		const [member, rank] = await Promise.all([
			this.memberModel
				.findOne({ phone })
				.orFail(new BadRequestException('Account not found'))
				.select('_id notVerified')
				.lean()
				.exec(),
			this.rankModel.findOne().sort('rank').lean().exec(),
		])

		const [checkMemberData, checkMemberRank] = await Promise.all([
			this.memberDataModel.countDocuments({ member: member._id }).exec(),
			this.memberRankModel.count({ member: member._id }).exec(),
		])

		await Promise.all([
			!member.notVerified
				? undefined
				: this.memberModel
						.updateOne(
							{ _id: member._id },
							{ $unset: { notVerified: 0 } },
							session ? { session } : {}
						)
						.exec(),
			checkMemberData
				? undefined
				: this.memberDataModel.create<MemberData>(
						[{ member: member._id }],
						session ? { session } : {}
				  ),
			checkMemberRank
				? undefined
				: this.memberRankModel.create<MemberRank>(
						[
							{
								member: member._id,
								code: 'M' + Math.floor(Date.now() / 1000),
								rank: rank._id,
							},
						],
						session ? { session } : {}
				  ),
		])

		return member._id.toString()
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

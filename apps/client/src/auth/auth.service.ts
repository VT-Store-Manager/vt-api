import { ClientSession, Model } from 'mongoose'

import {
	Member,
	MemberData,
	MemberDataDocument,
	MemberDocument,
	MemberRank,
	MemberRankDocument,
	Rank,
	RankDocument,
} from '@app/database'
import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { RegisterMemberDTO } from './dto/register-member.dto'
import { getListVnPhone, validateAndTransformPhone } from '@app/common'

@Injectable()
export class AuthService {
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
		const phone = validateAndTransformPhone(dto.phone)
		const member = await this.memberModel.create(
			[
				{
					phone,
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
			.findOne({ phone: { $in: getListVnPhone(phone) } })
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
				.findOne({ phone: { $in: getListVnPhone(phone) } })
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

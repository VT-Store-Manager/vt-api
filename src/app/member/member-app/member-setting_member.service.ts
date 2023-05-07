import { Model, Types } from 'mongoose'

import { Member, MemberDocument } from '@/schemas/member.schema'
import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { UpdateProfileDTO } from './dto/update-profile.dto'
import { CreateMemberAddressDTO } from './dto/create-member-address.dto'
import { MemberData, MemberDataDocument } from '@/schemas/member-data.schema'
import { MemberAddress } from '@/schemas/member-address.schema'
import { difference } from 'lodash'

@Injectable()
export class MemberSettingService {
	constructor(
		@InjectModel(Member.name)
		private readonly memberModel: Model<MemberDocument>,
		@InjectModel(MemberData.name)
		private readonly memberDataModel: Model<MemberDataDocument>
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

	async addNewAddress(memberId: string, data: CreateMemberAddressDTO) {
		const oldData = await this.memberDataModel
			.findOne({
				member: new Types.ObjectId(memberId),
			})
			.orFail(new BadRequestException('Member data not found'))
			.select('address')
			.lean()
			.exec()
		const addressData: MemberAddress = {
			...data,
			latLng: [data.lat, data.lng],
		}
		const newData = await this.memberDataModel
			.findOneAndUpdate(
				{
					member: new Types.ObjectId(memberId),
				},
				{
					$push: {
						'address.other': addressData,
					},
				},
				{
					new: true,
				}
			)
			.select('address')
			.lean()
			.exec()
		const newAddress = difference(
			newData.address.other.map(address => address._id.toString()),
			oldData.address.other.map(address => address._id.toString())
		)

		if (newAddress.length === 0) {
			throw new InternalServerErrorException()
		}

		return newData.address.other.find(
			address => address._id.toString() === newAddress[0]
		)
	}
}

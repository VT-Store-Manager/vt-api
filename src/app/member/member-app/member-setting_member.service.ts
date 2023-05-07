import { difference } from 'lodash'
import { Model, Types } from 'mongoose'

import { SettingMemberAppService } from '@/app/setting/services/setting-member-app.service'
import { MongoSessionService } from '@/providers/mongo/session.service'
import { MemberAddress } from '@/schemas/member-address.schema'
import { MemberData, MemberDataDocument } from '@/schemas/member-data.schema'
import { Member, MemberDocument } from '@/schemas/member.schema'
import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { CreateMemberAddressDTO } from './dto/create-member-address.dto'
import {
	GetMemberAddressDTO,
	MemberAddressItemDTO,
	MemberDefaultAddressItemDTO,
} from './dto/response.dto'
import { UpdateProfileDTO } from './dto/update-profile.dto'

@Injectable()
export class MemberSettingService {
	constructor(
		@InjectModel(Member.name)
		private readonly memberModel: Model<MemberDocument>,
		@InjectModel(MemberData.name)
		private readonly memberDataModel: Model<MemberDataDocument>,
		private readonly settingMemberAppService: SettingMemberAppService,
		private readonly mongoSessionService: MongoSessionService
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
		const [oldData, { address: addressSetting }] = await Promise.all([
			this.memberDataModel
				.findOne({
					member: new Types.ObjectId(memberId),
				})
				.orFail(new BadRequestException('Member data not found'))
				.select('address')
				.lean()
				.exec(),
			this.settingMemberAppService.getData({
				address: true,
			}),
		])
		const addressData: MemberAddress = {
			...data,
			latLng: [data.lat, data.lng],
		}
		const newData = await (async () => {
			if (
				addressSetting.other.limit &&
				oldData.address.other.length >= addressSetting.other.limit
			) {
				let result: MemberData
				const { error } = await this.mongoSessionService.execTransaction(
					async session => {
						const firstUpdate = await this.memberDataModel
							.updateOne(
								{
									member: new Types.ObjectId(memberId),
								},
								{
									$push: {
										'address.other': {
											$each: [addressData],
											$position: 0,
										},
									},
								},
								{
									session,
								}
							)
							.exec()
						if (firstUpdate.modifiedCount === 0) {
							throw new Error('Insert new address failed')
						}
						result = await this.memberDataModel
							.findOneAndUpdate(
								{
									member: new Types.ObjectId(memberId),
								},
								{
									$pop: {
										'address.other': 1,
									},
								},
								{
									new: true,
									session,
								}
							)
							.select('address')
							.lean()
							.exec()
					}
				)
				if (error) {
					throw new InternalServerErrorException(error.message)
				}
				return result
			} else {
				return this.memberDataModel
					.findOneAndUpdate(
						{
							member: new Types.ObjectId(memberId),
						},
						{
							$push: {
								'address.other': {
									$each: [addressData],
									$position: 0,
								},
							},
						},
						{
							new: true,
						}
					)
					.select('address')
					.lean()
					.exec()
			}
		})()
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

	async getAddress(memberId: string): Promise<GetMemberAddressDTO> {
		const [{ address: addressSetting }, addresses] = await Promise.all([
			this.settingMemberAppService.getData({
				address: true,
			}),
			this.memberDataModel
				.aggregate<{
					default: MemberAddressItemDTO[]
					other: MemberAddressItemDTO[]
				}>([
					{
						$match: {
							member: new Types.ObjectId(memberId),
						},
					},
					{
						$replaceRoot: {
							newRoot: '$address',
						},
					},
					{
						$project: {
							default: {
								$map: {
									input: '$main',
									as: 'addr',
									in: {
										id: {
											$toString: '$$addr._id',
										},
										name: '$$addr.name',
										icon: '',
										address: '$$addr.address',
										note: '$$addr.note',
										receiver: '$$addr.receiver',
										phone: '$$addr.phone',
									},
								},
							},
							other: {
								$map: {
									input: '$other',
									as: 'addr',
									in: {
										id: {
											$toString: '$$addr._id',
										},
										name: '$$addr.name',
										icon: '',
										address: '$$addr.address',
										note: '$$addr.note',
										receiver: '$$addr.receiver',
										phone: '$$addr.phone',
									},
								},
							},
						},
					},
				])
				.exec(),
		])
		if (addresses.length === 0) {
			throw new BadRequestException('Member data not found')
		}
		const address = addresses[0]
		// Get default addresses
		const defaultAddress: MemberDefaultAddressItemDTO[] = (() => {
			const defaultAddressMap = new Map(
				address.default.map(addr => [addr.id, addr])
			)
			return addressSetting.main.map(mainSettingData => {
				const addrData = defaultAddressMap.get(mainSettingData._id.toString())
				const defaultData: MemberDefaultAddressItemDTO = {
					id: mainSettingData._id.toString(),
					name: mainSettingData.name,
					icon: mainSettingData.icon,
				}

				if (!addrData) {
					return defaultData
				}
				const fullData: MemberAddressItemDTO = {
					...defaultData,
					address: addrData.address,
					note: addrData.note,
					receiver: addrData.receiver,
					phone: addrData.phone,
				}
				return fullData
			})
		})()
		// Get other addresses
		const otherAddress: MemberAddressItemDTO[] = address.other.map(addr => {
			addr.icon = addressSetting.other.icon
			return addr
		})

		return { defaultAddress, otherAddress }
	}
}

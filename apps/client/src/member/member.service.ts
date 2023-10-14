import { difference } from 'lodash'
import { Model, Types, UpdateQuery } from 'mongoose'

import { SettingMemberAppService } from '@app/common'
import {
	CartTemplate,
	CartTemplateDocument,
	Member,
	MemberAddress,
	MemberData,
	MemberDataDocument,
	MemberDocument,
	MemberVoucher,
	MemberVoucherDocument,
	MongoSessionService,
} from '@app/database'
import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'

import { CreateMemberAddressDTO } from './dto/create-member-address.dto'
import {
	AppBarDTO,
	GetMemberAddressDTO,
	MemberAddressItemDTO,
	MemberDefaultAddressItemDTO,
} from './dto/response.dto'
import { UpdateMemberAddressDTO } from './dto/update-member-address.dto'
import { UpdateProfileDTO } from './dto/update-profile.dto'

@Injectable()
export class MemberService {
	private readonly imageUrl: string
	constructor(
		@InjectModel(Member.name)
		private readonly memberModel: Model<MemberDocument>,
		@InjectModel(MemberData.name)
		private readonly memberDataModel: Model<MemberDataDocument>,
		@InjectModel(MemberVoucher.name)
		private readonly memberVoucherModel: Model<MemberVoucherDocument>,
		@InjectModel(CartTemplate.name)
		private readonly cartTemplateModel: Model<CartTemplateDocument>,
		private readonly settingMemberAppService: SettingMemberAppService,
		private readonly mongoSessionService: MongoSessionService,
		private readonly configService: ConfigService
	) {
		this.imageUrl = this.configService.get<string>('imageUrl')
	}

	async getProfile(memberId: string) {
		const memberData = await this.memberModel
			.findById(memberId)
			.orFail(new BadRequestException('Member not found'))
			.select({
				_id: false,
				firstName: true,
				lastName: true,
				dob: { $toLong: '$dob' },
				gender: true,
				phone: true,
			})
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
										lat: { $first: '$$addr.latLng' },
										lng: { $arrayElemAt: ['$$addr.latLng', 1] },
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
										lat: { $first: '$$addr.latLng' },
										lng: { $arrayElemAt: ['$$addr.latLng', 1] },
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
					lat: addrData.lat,
					lng: addrData.lng,
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

	async updateAddress(
		memberId: string,
		addressId: string,
		data: UpdateMemberAddressDTO
	) {
		const addressData: MemberAddress = {
			...data,
			latLng: [data.lat, data.lng],
		}
		const [memberAddress, { address: addressSetting }] = await Promise.all([
			this.memberDataModel
				.findOne({ member: new Types.ObjectId(memberId) })
				.orFail(new BadRequestException('Member data not found'))
				.select('address')
				.lean()
				.exec(),
			this.settingMemberAppService.getData({ address: true }),
		])
		const mainIndex = memberAddress.address.main.findIndex(
			addr => addr._id.toString() === addressId
		)
		let updateQuery: UpdateQuery<MemberData>
		if (mainIndex !== -1) {
			const fieldName = `address.main.${mainIndex}`
			updateQuery = {
				$set: {
					[fieldName]: {
						...memberAddress.address.main?.[mainIndex],
						...addressData,
						name: undefined,
					},
				},
			}
		} else if (
			addressSetting.main.findIndex(
				addr => addr._id.toString() === addressId
			) !== -1
		) {
			updateQuery = {
				$push: {
					'address.main': {
						_id: new Types.ObjectId(addressId),
						...addressData,
						name: undefined,
					},
				},
			}
		} else {
			const otherIndex = memberAddress.address.other.findIndex(
				addr => addr._id.toString() === addressId
			)
			if (otherIndex === -1) {
				throw new BadRequestException('Member address not found')
			}
			const fieldName = `address.other.${otherIndex}`
			updateQuery = {
				$set: {
					[fieldName]: {
						...memberAddress.address.other?.[otherIndex],
						...addressData,
					},
				},
			}
		}

		const updateResult = await this.memberDataModel.updateOne(
			{
				member: new Types.ObjectId(memberId),
			},
			updateQuery
		)
		return updateResult.matchedCount === 1
	}

	async deleteAddress(memberId: string, addressId: string) {
		const updateResult = await this.memberDataModel
			.updateOne(
				{
					member: new Types.ObjectId(memberId),
				},
				{
					$pull: {
						'address.main': {
							_id: new Types.ObjectId(addressId),
						},
						'address.other': {
							_id: new Types.ObjectId(addressId),
						},
					},
				}
			)
			.orFail(new BadRequestException('Member data not found'))
			.exec()
		return updateResult.modifiedCount === 1
	}

	async togglePushNotification(memberId: string) {
		const updateResult = await this.memberDataModel
			.updateOne(
				{
					member: new Types.ObjectId(memberId),
				},
				[
					{
						$set: {
							'setting.pushNotification': { $not: '$setting.pushNotification' },
						},
					},
				]
			)
			.orFail(new BadRequestException('Member data not found'))
			.exec()

		return updateResult.modifiedCount === 1
	}

	async getAppBarData(memberId: string): Promise<AppBarDTO> {
		const now = new Date()
		type CountType = { count: number }

		const [
			notificationCount,
			voucherCount,
			templateCount,
			members,
			{ greeting },
		] = await Promise.all([
			this.memberDataModel
				.aggregate<CountType>([
					{
						$match: {
							member: new Types.ObjectId(memberId),
						},
					},
					{
						$project: {
							count: {
								$size: {
									$filter: {
										input: '$notifications',
										as: 'item',
										cond: {
											$eq: ['$$item.checked', false],
										},
									},
								},
							},
							_id: false,
						},
					},
				])
				.exec(),
			this.memberVoucherModel
				.aggregate<CountType>([
					{
						$lookup: {
							from: 'vouchers',
							localField: 'voucher',
							foreignField: '_id',
							as: 'voucher',
						},
					},
					{
						$unwind: {
							path: '$voucher',
						},
					},
					{
						$match: {
							'voucher.disabled': false,
							'voucher.deleted': false,
							member: new Types.ObjectId(memberId),
							startTime: {
								$lte: now,
							},
							finishTime: {
								$gt: now,
							},
							disabled: false,
							$and: [
								{
									$or: [
										{
											'voucher.activeStartTime': null,
										},
										{
											'voucher.activeStartTime': {
												$lte: now,
											},
										},
									],
								},
								{
									$or: [
										{
											'voucher.activeStartTime': null,
										},
										{
											'voucher.activeStartTime': {
												$lte: now,
											},
										},
									],
								},
							],
						},
					},
					{
						$group: {
							_id: '$member',
							vouchers: {
								$push: '$voucher._id',
							},
						},
					},
					{
						$project: {
							count: {
								$size: '$vouchers',
							},
							_id: false,
						},
					},
				])
				.exec(),
			this.cartTemplateModel
				.aggregate<CountType>([
					{
						$match: {
							member: new Types.ObjectId(memberId),
						},
					},
					{
						$group: {
							_id: '$member',
							templates: {
								$push: '$_id',
							},
						},
					},
					{
						$project: {
							count: {
								$size: '$templates',
							},
							_id: false,
						},
					},
				])
				.exec(),
			this.memberModel.aggregate([
				{
					$match: {
						_id: new Types.ObjectId(memberId),
					},
				},
				{
					$project: {
						firstName: true,
						lastName: true,
						fullName: {
							$concat: ['$firstName', ' ', '$lastName'],
						},
						_id: false,
					},
				},
			]),
			this.settingMemberAppService.getData({ greeting: true }),
		])
		if (notificationCount.length === 0) {
			throw new BadRequestException('Member data not found')
		}
		if (members.length === 0) {
			throw new BadRequestException('Member not found')
		}

		return {
			image: this.imageUrl + greeting.image,
			greeting: Object.keys(members[0]).reduce((res, key) => {
				return res.replaceAll(
					new RegExp(`{{\s{0,}${key}\s{0,}}}`, 'g'),
					members[0][key]
				)
			}, greeting.content),
			templateCartAmount: templateCount?.[0]?.count ?? 0,
			voucherAmount: voucherCount?.[0]?.count ?? 0,
			notifyAmount: notificationCount?.[0]?.count ?? 0,
		}
	}
}

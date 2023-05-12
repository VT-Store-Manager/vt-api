import { Model, Types } from 'mongoose'

import { s3KeyPattern } from '@/common/constants'
import { SettingGeneralService } from '@module/setting/services/setting-general.service'
import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { MemberData, MemberDataDocument } from '@schema/member-data.schema'
import { Store, StoreDocument } from '@schema/store.schema'

import { ShortStoreItemDTO, StoreDetailDTO } from './dto/response.dto'

@Injectable()
export class StoreMemberService {
	private readonly imageUrl: string
	constructor(
		@InjectModel(Store.name) private readonly storeModel: Model<StoreDocument>,
		@InjectModel(MemberData.name)
		private readonly memberDataModel: Model<MemberDataDocument>,
		private readonly settingGeneralService: SettingGeneralService,
		private readonly configService: ConfigService
	) {
		this.imageUrl = configService.get<string>('imageUrl')
	}

	async getAllStoresInShort(memberId?: string): Promise<ShortStoreItemDTO[]> {
		const [stores, memberData] = await Promise.all([
			this.storeModel
				.find({
					disabled: false,
					deleted: false,
				})
				.select({
					name: true,
					images: {
						$filter: {
							input: {
								$map: {
									input: '$images',
									as: 'image',
									in: {
										$cond: [
											{
												$regexMatch: {
													input: '$$image',
													regex: s3KeyPattern,
												},
											},
											{ $concat: [this.imageUrl, '$$image'] },
											null,
										],
									},
								},
							},
							as: 'image',
							cond: {
								$ne: ['$$image', null],
							},
						},
					},
					address: true,
				})
				.lean({ virtuals: true })
				.exec(),
			memberId
				? this.memberDataModel
						.findOne({ member: new Types.ObjectId(memberId) })
						.select('favoriteStores')
						.lean()
						.exec()
				: null,
		])
		if (memberData) {
			return stores.map(store => ({
				id: store._id.toString(),
				name: store.name,
				image: store.images?.[0] || null,
				address: store.fullAddress,
				distance: +(Math.random() * 20).toFixed(1),
				isFavorite:
					memberData.favoriteStores.findIndex(
						id => id.toString() === store._id.toString()
					) > -1,
			}))
		} else {
			return stores.map(store => ({
				id: store._id.toString(),
				name: store.name,
				image: store.images?.[0] || null,
				address: store.fullAddress,
				distance: +(Math.random() * 20).toFixed(1),
				isFavorite: false,
			}))
		}
	}

	async getStoreDetail(storeId: string): Promise<StoreDetailDTO> {
		const [storeData, settingData] = await Promise.all([
			this.storeModel
				.findById(storeId)
				.orFail(new BadRequestException('Store not found'))
				.select({
					id: '$_id',
					name: true,
					images: {
						$filter: {
							input: {
								$map: {
									input: '$images',
									as: 'image',
									in: {
										$cond: [
											{
												$regexMatch: {
													input: '$$image',
													regex: s3KeyPattern,
												},
											},
											{ $concat: [this.imageUrl, '$$image'] },
											null,
										],
									},
								},
							},
							as: 'image',
							cond: {
								$ne: ['$$image', null],
							},
						},
					},
					address: true,
					openTime: true,
					unavailableGoods: true,
				})
				.lean({ virtuals: true })
				.exec(),
			this.settingGeneralService.getData({ storeContact: 1, brand: 1 }),
		])

		return {
			id: storeData.id.toString(),
			openTime: `${storeData.openTime.start} - ${storeData.openTime.end}`,
			phone: settingData.storeContact,
			images: storeData.images,
			mapImage: null,
			unavailableProducts: storeData.unavailableGoods.product as string[],
			unavailableCategories: storeData.unavailableGoods.category as string[],
			unavailableOptions: storeData.unavailableGoods.option as string[],
		}
	}

	async toggleFavoriteStore(memberId: string, storeId: string) {
		const memberData = await this.memberDataModel
			.findOne({ member: new Types.ObjectId(memberId) })
			.select('favoriteStores')
			.lean()
			.exec()

		const updateResult = await this.memberDataModel.updateOne(
			{
				member: new Types.ObjectId(memberId),
			},
			memberData.favoriteStores.findIndex(id => id.toString() === storeId) ===
				-1
				? {
						$push: { favoriteStores: new Types.ObjectId(storeId) },
				  }
				: {
						$pull: { favoriteStores: new Types.ObjectId(storeId) },
				  }
		)

		return updateResult.modifiedCount === 1
	}
}

import { Model, Types } from 'mongoose'

import { getImagePath } from '@/common/helpers/file.helper'
import { MemberData, MemberDataDocument } from '@/schemas/member-data.schema'
import { Store, StoreDocument } from '@/schemas/store.schema'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { ShortStoreItemDTO, StoreDetailDTO } from './dto/response.dto'
import { SettingGeneralService } from '@/app/setting/services/setting-general.service'

@Injectable()
export class StoreMemberService {
	constructor(
		@InjectModel(Store.name) private readonly storeModel: Model<StoreDocument>,
		@InjectModel(MemberData.name)
		private readonly memberDataModel: Model<MemberDataDocument>,
		private readonly settingGeneralService: SettingGeneralService
	) {}

	async getAllStoresInShort(memberId?: string): Promise<ShortStoreItemDTO[]> {
		const [stores, memberData] = await Promise.all([
			this.storeModel
				.find({
					disabled: false,
					deleted: false,
				})
				.select({
					name: true,
					images: true,
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
				image: getImagePath(store.images[0]),
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
				image: getImagePath(store.images[0]),
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
					images: true,
					mainImage: { $first: '$images' },
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
			images: storeData.images.map(image => getImagePath(image)),
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

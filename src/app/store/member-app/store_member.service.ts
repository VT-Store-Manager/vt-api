import { Model } from 'mongoose'

import { SettingType } from '@/common/constants'
import { SettingGeneralDocument } from '@/schemas/setting-general.schema'
import { Store, StoreDocument } from '@/schemas/store.schema'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { ShortStoreItemDTO, StoreDetailDTO } from './dto/response.dto'

@Injectable()
export class StoreMemberService {
	constructor(
		@InjectModel(Store.name) private readonly storeModel: Model<StoreDocument>,
		@InjectModel(SettingType.GENERAL)
		private readonly settingGeneralModel: Model<SettingGeneralDocument>
	) {}

	async getAllStoresInShort(): Promise<ShortStoreItemDTO[]> {
		const stores = await this.storeModel
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
			.exec()
		return stores.map(store => ({
			id: store._id.toString(),
			name: store.name,
			mainImage: store.images[0],
			fullAddress: store.fullAddress,
			distance: +(Math.random() * 20).toFixed(1),
		}))
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
				})
				.lean({ virtuals: true })
				.exec(),
			this.settingGeneralModel
				.findOne({})
				.select('storeContact brand')
				.lean()
				.exec(),
		])
		return {
			id: storeData.id.toString(),
			mainImage: storeData['mainImage'],
			images: storeData.images,
			dailyTime: `${storeData.openTime.start} - ${storeData.openTime.end}`,
			address: storeData.address,
			fullAddress: storeData.fullAddress,
			contact: settingData.storeContact,
			brandName: settingData.brand.name,
			distance: +(Math.random() * 20).toFixed(1),
		}
	}
}

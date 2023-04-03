import { Store, StoreDocument } from '@/schemas/store.schema'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ShortStoreItemDTO } from './dto/response.dto'

@Injectable()
export class StoreMemberService {
	constructor(
		@InjectModel(Store.name) private readonly storeModel: Model<StoreDocument>
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
}

import { ClientSession, Model } from 'mongoose'

import { Store, StoreDocument } from '@/schemas/store.schema'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { CounterService } from '../counter/counter.service'
import { CreateStoreDto } from './dto/create-store.dto'
import { GetListStoreDto } from './dto/get-list-store.dto'
import {
	ResponseStoreItem,
	ResponseStoreListDto,
} from './dto/response-store-item.dto'

@Injectable()
export class StoreService {
	constructor(
		@InjectModel(Store.name) private readonly storeModel: Model<StoreDocument>,
		private readonly counterService: CounterService
	) {}

	async create(data: CreateStoreDto, session?: ClientSession): Promise<Store> {
		const counter = await this.counterService.next('stores', session)
		const store = await this.storeModel.create(
			[{ code: counter, ...data }],
			session ? { session } : {}
		)
		return store[0]
	}

	async getList(query: GetListStoreDto): Promise<ResponseStoreListDto> {
		const [items, maxCount] = await Promise.all([
			this.storeModel
				.aggregate<ResponseStoreItem>()
				.project({
					id: '$_id',
					images: 1,
					name: 1,
					address: 1,
					updatedAt: 1,
					openedStatus: 1,
					disabled: 1,
					deleted: 1,
				})
				.project({ _id: 0 })
				.skip((query.page - 1) * query.limit)
				.limit(query.limit)
				.exec(),
			this.storeModel.countDocuments().exec(),
		])
		return { items, maxCount }
	}
}

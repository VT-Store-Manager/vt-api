import { ClientSession, Model } from 'mongoose'

import { Store, StoreDocument } from '@/schemas/store.schema'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { CounterService } from '../counter/counter.service'
import { CreateStoreDto } from './dto/create-store.dto'

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
}

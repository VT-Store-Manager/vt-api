import { Model } from 'mongoose'

import { Store, StoreDocument } from '@/schemas/store.schema'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { CounterService } from '../counter/counter.service'

@Injectable()
export class StoreService {
	constructor(
		@InjectModel(Store.name) private readonly storeModel: Model<StoreDocument>,
		private readonly counterService: CounterService
	) {}
}

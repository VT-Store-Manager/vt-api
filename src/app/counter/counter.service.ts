import { ClientSession, Model } from 'mongoose'

import { MongoException } from '@/common/exceptions/mongo.exception'
import { Counter, CounterDocument } from '@/schemas/counter.schema'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

@Injectable()
export class CounterService {
	constructor(
		@InjectModel(Counter.name)
		private readonly counterModel: Model<CounterDocument>
	) {}

	async create(collection: string, start = 1, session?: ClientSession) {
		try {
			const createCounter = await this.counterModel.create(
				[
					{
						collection,
						count: start,
					},
				],
				session ? { session } : {}
			)
			console.log(createCounter)
		} catch (error) {
			console.log(error)
			throw new MongoException(`Create counter ${collection} failed`)
		}
	}

	async next(collection: string, session?: ClientSession) {
		try {
			const counter = await this.counterModel
				.findOneAndUpdate(
					{ collection },
					{ $inc: { count: 1 } },
					session ? { session } : {}
				)
				.exec()
			return counter.count
		} catch (error) {
			console.log(error)
			throw new MongoException(`Increment counter ${collection} failed`)
		}
	}
}

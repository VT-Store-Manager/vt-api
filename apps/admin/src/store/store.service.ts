import { ClientSession, Types } from 'mongoose'

import { CounterService } from '@app/common'
import { Store, StoreDocument } from '@app/database'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { CreateStoreDTO } from './dto/create-store.dto'
import { GetListStoreDTO } from './dto/get-list-store.dto'
import {
	ResponseStoreItem,
	ResponseStoreListDTO,
} from './dto/response-store-item.dto'
import { ResponseStoreDetailDTO } from './dto/response-store-detail.dto'
import { SoftDeleteModel } from 'mongoose-delete'

@Injectable()
export class StoreService {
	constructor(
		@InjectModel(Store.name)
		private readonly storeModel: SoftDeleteModel<StoreDocument>,
		private readonly counterService: CounterService
	) {}

	async create(data: CreateStoreDTO, session?: ClientSession): Promise<Store> {
		const counter = await this.counterService.next('stores', session)
		const store = await this.storeModel.create(
			[{ code: counter, ...data }],
			session ? { session } : {}
		)
		return store[0]
	}

	async getList(query: GetListStoreDTO): Promise<ResponseStoreListDTO> {
		const [items, totalCount] = await Promise.all([
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
		return { totalCount, items }
	}

	async getStoreDetail(storeId: string): Promise<ResponseStoreDetailDTO> {
		const [store] = await this.storeModel
			.aggregate<ResponseStoreDetailDTO>([
				{
					$match: {
						_id: new Types.ObjectId(storeId),
					},
				},
				{
					$lookup: {
						from: 'products',
						localField: 'unavailableGoods.product',
						foreignField: '_id',
						as: 'unavailableGoods.product',
						pipeline: [
							{
								$project: {
									id: '$_id',
									_id: false,
									name: true,
									image: {
										$first: '$images',
									},
									category: true,
									deleted: true,
									disabled: true,
								},
							},
						],
					},
				},
				{
					$addFields: {
						id: '$_id',
					},
				},
				{
					$project: {
						_id: false,
					},
				},
			])
			.exec()

		if (!store) throw new BadRequestException('Store not found')

		return store
	}
}

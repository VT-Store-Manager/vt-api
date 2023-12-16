import { ClientSession, Types } from 'mongoose'

import { CounterService } from '@app/common'
import {
	Product,
	ProductCategory,
	ProductCategoryDocument,
	ProductDocument,
	ProductOption,
	ProductOptionDocument,
	Store,
	StoreDocument,
} from '@app/database'
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
import { UpdateUnavailableGoodsDTO } from './dto/update-unavailable-goods.dto'
import { uniq } from 'lodash'
import { UpdateStoreInfoDTO } from './dto/update-store-info.dto'

@Injectable()
export class StoreService {
	constructor(
		@InjectModel(Store.name)
		private readonly storeModel: SoftDeleteModel<StoreDocument>,
		private readonly counterService: CounterService,
		@InjectModel(Product.name)
		private readonly productModel: SoftDeleteModel<ProductDocument>,
		@InjectModel(ProductCategory.name)
		private readonly productCategoryModel: SoftDeleteModel<ProductCategoryDocument>,
		@InjectModel(ProductOption.name)
		private readonly productOptionModel: SoftDeleteModel<ProductOptionDocument>
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

	async getStoreImages(storeId: string) {
		const storeImages = await this.storeModel
			.findOne({ _id: new Types.ObjectId(storeId) })
			.orFail(new BadRequestException('Store not found'))
			.select('images')
			.lean()
			.exec()

		return storeImages.images
	}

	async updateStoreImage(
		storeId: string,
		images: string[],
		session: ClientSession
	) {
		const updateResult = await this.storeModel
			.updateOne(
				{ _id: new Types.ObjectId(storeId) },
				{ $set: { images } },
				{ session }
			)
			.orFail(new BadRequestException('Store not found'))
			.exec()

		return updateResult.matchedCount > 0
	}

	async updateStoreUnavailableGoods(data: UpdateUnavailableGoodsDTO) {
		data.product = uniq(data.product)
		data.category = uniq(data.category)
		data.option = uniq(data.option)

		const [_, countProduct, countCategory, countOption] = await Promise.all([
			this.storeModel
				.exists({ _id: new Types.ObjectId(data.storeId) })
				.orFail(new BadRequestException('Store not found'))
				.exec(),
			this.productModel
				.countWithDeleted({
					_id: { $in: data.product.map(id => new Types.ObjectId(id)) },
				})

				.exec(),
			this.productCategoryModel
				.countWithDeleted({
					_id: { $in: data.category.map(id => new Types.ObjectId(id)) },
				})
				.exec(),
			this.productOptionModel
				.countWithDeleted({
					_id: { $in: data.option.map(id => new Types.ObjectId(id)) },
				})
				.exec(),
		])

		if (countProduct < data.product.length) {
			throw new BadRequestException('Contain invalid product')
		} else if (countCategory < data.category.length) {
			throw new BadRequestException('Contain invalid category')
		} else if (countOption < data.option.length) {
			throw new BadRequestException('Contain invalid option')
		}

		const updateResult = await this.storeModel
			.updateOne(
				{
					_id: new Types.ObjectId(data.storeId),
				},
				{
					$set: {
						unavailableGoods: {
							product: data.product,
							category: data.category,
							option: data.option,
						},
					},
				}
			)
			.exec()

		return updateResult.matchedCount > 0
	}

	async updateStoreInfo(data: UpdateStoreInfoDTO) {
		const updatedResult = await this.storeModel
			.updateOne(
				{ _id: new Types.ObjectId(data.storeId) },
				{
					$set: {
						name: data.name,
						openTime: data.openTime,
						address: data.address,
						...(data.lat && data.lng
							? {
									lat: data.lat,
									lng: data.lng,
							  }
							: {}),
					},
				}
			)
			.exec()

		return updatedResult.matchedCount > 0
	}
}

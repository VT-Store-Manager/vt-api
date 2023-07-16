import { ClientSession, Model } from 'mongoose'

import { CounterService, Status } from '@app/common'
import {
	Product,
	ProductCategory,
	ProductCategoryDocument,
	ProductDocument,
} from '@app/database'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { GetProductCategoryPaginationDTO } from './dto/get-product-category-pagination'
import {
	ProductCategoryListItemDTO,
	ProductCategoryListPaginationDTO,
	ProductCategorySelectDataDTO,
} from './dto/response.dto'

type CreateProductCategoryModel = Pick<ProductCategory, 'image' | 'name'>

@Injectable()
export class ProductCategoryService {
	constructor(
		@InjectModel(ProductCategory.name)
		private readonly productCategoryModel: Model<ProductCategoryDocument>,
		@InjectModel(Product.name)
		private readonly productModel: Model<ProductDocument>,
		private readonly counterService: CounterService
	) {}

	async create(data: CreateProductCategoryModel, session?: ClientSession) {
		const [counter, { displayOrder }] = await Promise.all([
			this.counterService.next('product_categories', session),
			this.productCategoryModel
				.findOne()
				.sort('-displayOrder')
				.select('displayOrder')
				.lean()
				.exec(),
		])

		const category = await this.productCategoryModel.create(
			[
				{
					code: counter,
					displayOrder: displayOrder + 1,
					...data,
				},
			],
			session ? { session } : {}
		)
		return category[0]
	}

	async getListPagination(
		query: GetProductCategoryPaginationDTO
	): Promise<ProductCategoryListPaginationDTO> {
		const [totalCount, data, productCount] = await Promise.all([
			this.productCategoryModel.count().exec(),
			this.productCategoryModel
				.aggregate<ProductCategoryListItemDTO>([
					{
						$sort: {
							isFeatured: -1,
							displayOrder: 1,
							createdAt: -1,
						},
					},
					{
						$skip: (query.page - 1) * query.limit,
					},
					{
						$limit: query.limit,
					},
					{
						$project: {
							id: { $toString: '$_id' },
							_id: 0,
							name: 1,
							image: 1,
							code: 1,
							status: {
								$cond: {
									if: { $eq: ['$deleted', true] },
									then: Status.REMOVED,
									else: {
										$cond: {
											if: { $eq: ['$disabled', true] },
											then: Status.DISABLED,
											else: Status.ACTIVE,
										},
									},
								},
							},
							amountOfProduct: { $ifNull: ['$amountOfProduct', 0] },
							totalSold: { $ifNull: ['$totalSold', 0] },
							soldOfWeek: { $ifNull: ['$soldOfWeek', 0] },
							order: { $ifNull: ['$displayOrder', 1] },
							featured: { $ifNull: ['$isFeatured', false] },
							updatedAt: { $toLong: '$updatedAt' },
						},
					},
				])
				.exec(),
			this.productModel
				.aggregate<{ category: string; productAmount: number }>([
					{
						$group: {
							_id: '$category',
							productIds: {
								$push: '$_id',
							},
						},
					},
					{
						$project: {
							category: { $toString: '$_id' },
							_id: false,
							productAmount: {
								$size: '$productIds',
							},
						},
					},
				])
				.exec(),
		])
		const productCountMap = new Map(
			productCount.map(category => [category.category, category])
		)
		data.forEach(category => {
			category.amountOfProduct =
				productCountMap.get(category.id)?.productAmount || 0
		})
		return {
			totalCount,
			items: data,
		}
	}

	async delete(id: string) {
		const deletedStatus = await this.productCategoryModel.updateOne(
			{ _id: id, deleted: false },
			{
				deleted: true,
				deletedAt: new Date(),
			}
		)

		return deletedStatus.modifiedCount === 1
			? 'Delete successful'
			: 'Category is not found or is deleted'
	}

	async isExist(...listIds: string[]): Promise<string[]> {
		const products = await this.productCategoryModel
			.find({ _id: { $in: listIds } })
			.select('_id')
			.lean()
			.exec()
		return listIds.filter(
			id => !products.some(product => id === product._id.toString())
		)
	}

	async getSelectList(): Promise<ProductCategorySelectDataDTO[]> {
		return await this.productCategoryModel
			.aggregate<ProductCategorySelectDataDTO>([
				{
					$match: {
						deleted: false,
					},
				},
				{
					$sort: {
						isFeatured: -1,
						displayOrder: 1,
						createdAt: -1,
					},
				},
				{
					$project: {
						_id: false,
						title: '$name',
						value: { $toString: '$_id' },
						image: '$image',
						disabled: '$disabled',
					},
				},
			])
			.exec()
	}
}

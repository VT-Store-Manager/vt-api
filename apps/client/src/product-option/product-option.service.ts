import { Model } from 'mongoose'

import { ProductOption, ProductOptionDocument } from '@app/database'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { GetAllProductOptionDTO } from './dto/response.dto'

@Injectable()
export class ProductOptionService {
	constructor(
		@InjectModel(ProductOption.name)
		private readonly productOptionModel: Model<ProductOptionDocument>
	) {}

	async getAllProductOptions() {
		return await this.productOptionModel
			.aggregate<GetAllProductOptionDTO>([
				{
					$match: {
						deleted: false,
						disabled: false,
					},
				},
				{
					$lookup: {
						from: 'product_options',
						localField: 'parent',
						foreignField: '_id',
						as: 'parent',
					},
				},
				{
					$unwind: {
						path: '$parent',
						preserveNullAndEmptyArrays: true,
					},
				},
				{
					$project: {
						id: '$_id',
						_id: false,
						name: {
							$ifNull: ['$parent.name', '$name'],
						},
						minSelected: { $first: '$range' },
						maxSelected: { $arrayElemAt: ['$range', 1] },
						defaultSelect: {
							$filter: {
								input: {
									$map: {
										input: '$items',
										as: 'item',
										in: {
											$cond: [
												{ $eq: ['$$item.isDefault', true] },
												{ $ifNull: ['$$item.parentKey', '$$item.key'] },
												null,
											],
										},
									},
								},
								as: 'item',
								cond: { $ne: ['$$item', null] },
							},
						},
						optionItems: {
							$map: {
								input: '$items',
								as: 'item',
								in: {
									id: { $ifNull: ['$$item.parentKey', '$$item.key'] },
									name: '$$item.name',
									cost: '$$item.cost',
									disable: '$$item.disabled',
								},
							},
						},
					},
				},
			])
			.exec()
	}
}

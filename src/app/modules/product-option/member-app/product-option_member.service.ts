import { Model } from 'mongoose'

import {
	ProductOption,
	ProductOptionDocument,
} from '@schema/product-option.schema'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { GetAllProductOptionDTO } from './dto/response.dto'

@Injectable()
export class ProductOptionMemberService {
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
						defaultSelect: '$defaultSelect',
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

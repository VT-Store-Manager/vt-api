import {
	ProductOption,
	ProductOptionDocument,
} from '@/schemas/product-option.schema'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
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
						range: true,
						items: true,
					},
				},
				{
					$project: {
						'items.parentKey': false,
					},
				},
			])
			.exec()
	}
}

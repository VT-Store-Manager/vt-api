import { Model, Types } from 'mongoose'

import { Product, ProductDocument } from '@/schemas/product.schema'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { DetailProductDTO, ShortProductItemDTO } from './dto/response.dto'
import { Member, MemberDocument } from '@/schemas/member.schema'
import { Store, StoreDocument } from '@/schemas/store.schema'

@Injectable()
export class ProductMemberService {
	constructor(
		@InjectModel(Product.name)
		private readonly productModel: Model<ProductDocument>,
		@InjectModel(Member.name)
		private readonly memberModel: Model<MemberDocument>,
		@InjectModel(Store.name)
		private readonly storeModel: Model<StoreDocument>
	) {}

	async getShortInfoAllProduct() {
		return await this.productModel
			.aggregate<ShortProductItemDTO>()
			.project({
				id: '$_id',
				name: 1,
				mainImage: { $first: '$images' },
				price: '$originalPrice',
			})
			.project({
				_id: 0,
			})
			.exec()
	}

	async getDetailProduct(
		memberId: string,
		productId: string,
		storeId?: string
	): Promise<DetailProductDTO> {
		const [memberData, productData, storeData] = await Promise.all([
			this.memberModel.findById(memberId).select('favorites').lean().exec(),
			this.productModel
				.aggregate<Omit<DetailProductDTO, 'isFavorite'>>()
				.match({ _id: new Types.ObjectId(productId) })
				.project({
					id: '$_id',
					name: 1,
					mainImage: { $first: '$images' },
					price: '$originalPrice',
					description: 1,
					images: '$images',
					optionIDs: '$options',
				})
				.project({
					_id: 0,
				})
				.exec(),
			this.storeModel
				.findById(storeId)
				.select('unavailableGoods')
				.lean()
				.exec(),
		])

		if (!productData.length) throw new BadRequestException('Product not found')

		const product = productData[0]

		if (storeId && storeData) {
			product.optionIDs = product.optionIDs.filter(
				option =>
					!storeData.unavailableGoods.option.some(
						id => id.toString() === option.toString()
					)
			)
		}

		const isFavorite = memberData.favorites.some(
			id => id.toString() === productId
		)

		return {
			...productData[0],
			isFavorite,
		}
	}

	async getSuggestionList(memberId: string, limit: number) {
		const products = await this.productModel
			.aggregate<ShortProductItemDTO>()
			.project({
				id: '$_id',
				name: 1,
				mainImage: { $first: '$images' },
				price: '$originalPrice',
				_id: false,
			})
			.sample(limit)
			.exec()
		return products
	}
}

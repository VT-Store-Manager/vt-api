import { Model, Types } from 'mongoose'

import { getImagePath } from '@/common/helpers/file.helper'
import { MemberData, MemberDataDocument } from '@/schemas/member-data.schema'
import { Product, ProductDocument } from '@/schemas/product.schema'
import { Store, StoreDocument } from '@/schemas/store.schema'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { DetailProductDTO, ProductListItemDTO } from './dto/response.dto'

@Injectable()
export class ProductMemberService {
	constructor(
		@InjectModel(Product.name)
		private readonly productModel: Model<ProductDocument>,
		@InjectModel(MemberData.name)
		private readonly memberDataModel: Model<MemberDataDocument>,
		@InjectModel(Store.name)
		private readonly storeModel: Model<StoreDocument>
	) {}

	async getAllProducts() {
		const allProducts = await this.productModel
			.aggregate<ProductListItemDTO>()
			.project({
				id: '$_id',
				name: true,
				cost: '$originalPrice',
				image: { $first: '$images' },
				images: true,
				optionIds: '$options',
				description: true,
			})
			.project({
				_id: 0,
			})
			.exec()
		return allProducts.map(product => {
			product.image = getImagePath(product.image)
			product.images = product.images.map(image => getImagePath(image))
			return product
		})
	}

	async getDetailProduct(
		memberId: string,
		productId: string,
		storeId?: string
	): Promise<DetailProductDTO> {
		const [memberData, productData, storeData] = await Promise.all([
			this.memberDataModel
				.findOne({ member: new Types.ObjectId(memberId) })
				.select('favoriteProducts')
				.lean()
				.exec(),
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

		const isFavorite = memberData.favoriteProducts.some(
			id => id.toString() === productId
		)

		return {
			...productData[0],
			isFavorite,
		}
	}

	async getSuggestionList(memberId: string, limit: number) {
		const products = await this.productModel
			.aggregate<Pick<Product, '_id'>>()
			.project({
				_id: true,
			})
			.sample(limit)
			.exec()
		return {
			products: products.map(product => product._id.toString()),
		}
	}

	async toggleFavoriteProduct(memberId: string, productId: string) {
		const memberData = await this.memberDataModel
			.findOne({ member: new Types.ObjectId(memberId) })
			.select('favoriteProducts')
			.lean()
			.exec()

		const updateResult = await this.memberDataModel.updateOne(
			{
				member: new Types.ObjectId(memberId),
			},
			memberData.favoriteProducts.findIndex(
				id => id.toString() === productId
			) === -1
				? {
						$push: { favoriteProducts: new Types.ObjectId(productId) },
				  }
				: {
						$pull: { favoriteProducts: new Types.ObjectId(productId) },
				  }
		)

		return updateResult.modifiedCount === 1
	}

	async getAllFavorites(memberId: string) {
		const memberData = await this.memberDataModel
			.findOne({ member: new Types.ObjectId(memberId) })
			.select('favoriteProducts')
			.lean()
			.exec()
		return {
			products: memberData.favoriteProducts,
		}
	}
}

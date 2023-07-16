import { intersection } from 'lodash'
import { Model, Types } from 'mongoose'

import { s3KeyPattern } from '@app/common'
import {
	MemberData,
	MemberDataDocument,
	Product,
	ProductDocument,
	Store,
	StoreDocument,
} from '@app/database'
import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'

import { DetailProductDTO, ProductListItemDTO } from './dto/response.dto'

@Injectable()
export class ProductService {
	private readonly imageUrl: string
	constructor(
		@InjectModel(Product.name)
		private readonly productModel: Model<ProductDocument>,
		@InjectModel(MemberData.name)
		private readonly memberDataModel: Model<MemberDataDocument>,
		@InjectModel(Store.name)
		private readonly storeModel: Model<StoreDocument>,
		private readonly configService: ConfigService
	) {
		this.imageUrl = configService.get<string>('imageUrl')
	}

	async getAllProducts() {
		const allProducts = await this.productModel
			.aggregate<ProductListItemDTO>()
			.project({
				id: '$_id',
				_id: false,
				name: true,
				cost: '$originalPrice',
				images: {
					$filter: {
						input: {
							$map: {
								input: '$images',
								as: 'image',
								in: {
									$cond: [
										{
											$regexMatch: {
												input: '$$image',
												regex: s3KeyPattern,
											},
										},
										{ $concat: [this.imageUrl, '$$image'] },
										null,
									],
								},
							},
						},
						as: 'image',
						cond: {
							$ne: ['$$image', null],
						},
					},
				},
				optionIds: '$options',
				description: true,
			})
			.addFields({
				image: { $first: '$images' },
			})
			.exec()
		return allProducts
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
					_id: false,
					name: true,
					cost: '$originalPrice',
					images: {
						$filter: {
							input: {
								$map: {
									input: '$images',
									as: 'image',
									in: {
										$cond: [
											{
												$regexMatch: {
													input: '$$image',
													regex: s3KeyPattern,
												},
											},
											{ $concat: [this.imageUrl, '$$image'] },
											null,
										],
									},
								},
							},
							as: 'image',
							cond: {
								$ne: ['$$image', null],
							},
						},
					},
					optionIds: '$options',
					description: true,
				})
				.addFields({
					image: { $first: '$images' },
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
		const [memberData, products] = await Promise.all([
			this.memberDataModel
				.findOne({ member: new Types.ObjectId(memberId) })
				.select('favoriteProducts')
				.lean()
				.exec(),
			this.productModel
				.aggregate<{ id: string }>([
					{
						$project: {
							id: { $toString: '$_id' },
							_id: false,
						},
					},
				])
				.exec(),
		])
		return {
			products: intersection(
				memberData.favoriteProducts.map(id => id.toString()),
				products.map(product => product.id)
			),
		}
	}
}

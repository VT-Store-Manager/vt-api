import { Model, Types } from 'mongoose'

import { Product, ProductDocument } from '@/schemas/product.schema'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { DetailProductDTO, ShortProductItemDTO } from './dto/response.dto'
import { Member, MemberDocument } from '@/schemas/member.schema'

@Injectable()
export class ProductMemberService {
	constructor(
		@InjectModel(Product.name)
		private readonly productModel: Model<ProductDocument>,
		@InjectModel(Member.name)
		private readonly memberModel: Model<MemberDocument>
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
		productId: string
	): Promise<DetailProductDTO> {
		const [memberData, productData] = await Promise.all([
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
				})
				.project({
					_id: 0,
				})
				.exec(),
		])

		if (!productData.length) throw new BadRequestException('Product not found')

		const isFavorite = memberData.favorites.some(
			id => id.toString() === productId
		)

		return {
			...productData[0],
			isFavorite,
		}
	}
}

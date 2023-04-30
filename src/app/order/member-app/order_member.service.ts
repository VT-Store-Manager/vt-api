import { intersection, sortBy } from 'lodash'
import { Model, Types } from 'mongoose'

import {
	ValidatedCart,
	VoucherMemberService,
} from '@/app/voucher/member-app/voucher_member.service'
import {
	MemberVoucher,
	MemberVoucherDocument,
} from '@/schemas/member-voucher.schema'
import { ProductOptionItem } from '@/schemas/product-option-item.schema'
import {
	ProductOption,
	ProductOptionDocument,
} from '@/schemas/product-option.schema'
import { Product, ProductDocument } from '@/schemas/product.schema'
import { Voucher } from '@/schemas/voucher.schema'
import { ArrElement } from '@/types'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { CheckVoucherDTO } from './dto/check-voucher.dto'

type ShortProductValidationData = {
	_id: string
	category: string
	originalPrice: number
	options: Array<{
		_id: string
		range: [number, number]
		items: {
			parentKey: string
			key: string
			cost: number
			disabled: boolean
		}[]
		keyList: string[]
		disabled: boolean
		deleted: boolean
	}>
	optionIds: string[]
	disabled: boolean
	deleted: boolean
}

type ShortProductOptionValidationData = {
	_id: string
	range: [number, number]
	item: ProductOptionItem
	disabled: boolean
	deleted: boolean
}

@Injectable()
export class OrderMemberService {
	constructor(
		@InjectModel(MemberVoucher.name)
		private readonly memberVoucherModel: Model<MemberVoucherDocument>,
		@InjectModel(Product.name)
		private readonly productModel: Model<ProductDocument>,
		@InjectModel(ProductOption.name)
		private readonly productOptionModel: Model<ProductOptionDocument>,
		private readonly voucherService: VoucherMemberService
	) {}

	async checkVoucher(memberId: string, data: CheckVoucherDTO) {
		const now = new Date()
		const [memberVouchers, products, productOptions] = await Promise.all([
			this.memberVoucherModel
				.aggregate<MemberVoucher & { voucher: Voucher }>([
					{
						$match: {
							member: new Types.ObjectId(memberId),
							voucher: new Types.ObjectId(data.voucherId),
							startTime: { $lte: now },
							finishTime: { $gt: now },
						},
					},
					{
						$lookup: {
							from: 'vouchers',
							localField: 'voucher',
							foreignField: '_id',
							as: 'voucher',
						},
					},
					{
						$unwind: {
							path: '$voucher',
						},
					},
					{
						$match: {
							'voucher.disabled': false,
							'voucher.deleted': false,
							$and: [
								{
									$or: [
										{ 'voucher.activeStartTime': null },
										{
											'voucher.activeStartTime': {
												$lte: now,
											},
										},
									],
								},
								{
									$or: [
										{ 'voucher.activeStartTime': null },
										{
											'voucher.activeStartTime': {
												$lte: now,
											},
										},
									],
								},
							],
						},
					},
				])
				.exec(),
			this.productModel
				.aggregate<ShortProductValidationData>([
					{
						$match: {
							_id: {
								$in: data.products.map(
									product => new Types.ObjectId(product.id)
								),
							},
						},
					},
					{
						$lookup: {
							from: 'product_options',
							localField: 'options',
							foreignField: '_id',
							as: 'options',
						},
					},
					{
						$project: {
							_id: {
								$toString: '$_id',
							},
							originalPrice: true,
							category: {
								$toString: '$category',
							},
							options: {
								_id: {
									$toString: '$_id',
								},
								range: true,
								items: {
									parentKey: true,
									key: true,
									cost: true,
									disabled: true,
								},
								disabled: true,
								deleted: true,
							},
							optionIds: {
								$map: {
									input: '$options',
									as: 'option',
									in: {
										$toString: '$$option._id',
									},
								},
							},
							disabled: true,
							deleted: true,
						},
					},
				])
				.exec(),
			this.productOptionModel
				.aggregate<ShortProductOptionValidationData>([
					{
						$unwind: {
							path: '$items',
						},
					},
					{
						$project: {
							_id: {
								$toString: '$_id',
							},
							range: true,
							item: '$items',
							disabled: true,
							deleted: true,
						},
					},
				])
				.exec(),
		])

		if (memberVouchers.length === 0) {
			throw new BadRequestException('Voucher not found')
		}

		const [memberVoucher, productMap, optionKeyMap] = [
			memberVouchers[0],
			new Map(products.map(product => [product._id.toString(), product])),
			new Map(productOptions.map(option => [option.item.key, option])),
		]

		const productCartPrices = this.validateProducts(
			data.products,
			productMap,
			optionKeyMap
		)

		return this.voucherService.applyVoucherToCart(
			memberId,
			memberVoucher.voucher.condition,
			memberVoucher.voucher.discount,
			{
				shippingMethod: data.categoryId,
				products: productCartPrices,
			}
		)
	}

	private validateProducts(
		validatedProducts: CheckVoucherDTO['products'],
		productMap: Map<string, ShortProductValidationData>,
		optionKeyMap: Map<string, ShortProductOptionValidationData>
	) {
		const result = validatedProducts.map(
			(validateProduct): ArrElement<ValidatedCart['products']> => {
				const product = productMap.get(validateProduct.id)
				if (!product) {
					throw new BadRequestException(
						`Product ${validateProduct.id} not found`
					)
				}
				if (product.disabled) {
					throw new BadRequestException(
						`Product ${validateProduct.id} is disabled`
					)
				}
				if (product.deleted) {
					throw new BadRequestException(
						`Product ${validateProduct.id} is deleted`
					)
				}
				const price = product.originalPrice
				let requiredOptionPrice = 0,
					optionalOptionPrice = 0
				product.options.forEach(option => {
					const selectedKeys = intersection(
						option.items.map(item => item.parentKey),
						validateProduct.options
					)
					if (selectedKeys.length < option.range[0]) {
						throw new BadRequestException(
							`Option ${option._id} must contain more than ${option.range[0]} item`
						)
					}
					if (selectedKeys.length > option.range[1]) {
						throw new BadRequestException(
							`Option ${option._id} must contain less than ${option.range[1]} item`
						)
					}

					const selectedKeysData = selectedKeys.map(key => {
						const keyData = optionKeyMap.get(key)
						if (keyData.disabled || keyData.deleted) {
							throw new BadRequestException(
								`Product option ${key} is disabled or deleted`
							)
						}
						return keyData
					})

					sortBy(selectedKeysData, keyData => keyData.item.cost)
					requiredOptionPrice += selectedKeysData
						.slice(0, option.range[0])
						.reduce((res, keyData) => res + keyData.item.cost, 0)
					optionalOptionPrice += selectedKeysData
						.slice(option.range[0])
						.reduce((res, keyData) => res + keyData.item.cost, 0)
				})

				return {
					id: validateProduct.id,
					category: product.category,
					quantity: validateProduct.amount,
					price,
					requiredOptionPrice,
					optionalOptionPrice,
					options: validateProduct.options,
				}
			}
		)

		return result
	}
}

import { isNumber, sortBy } from 'lodash'
import { Model, Types } from 'mongoose'

import {
	s3KeyPattern,
	SettingGeneralService,
	SettingMemberAppService,
	ShippingMethod,
} from '@app/common'
import {
	MemberRank,
	MemberRankDocument,
	MemberVoucher,
	MemberVoucherDocument,
	Rank,
	SettingGeneral,
	SettingMemberApp,
	VoucherCondition,
	VoucherDiscount,
} from '@app/database'
import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { AvailableUserVoucherDTO } from './dto/response.dto'

export type ValidatedCart = {
	shippingMethod: ShippingMethod
	products: Array<{
		id: string
		category: string
		quantity: number
		price: number
		requiredOptionPrice: number
		optionalOptionPrice: number
		options: string[]
	}>
}
export type ApplyVoucherResult = {
	products: {
		id: string
		category: string
		options: string[]
		quantity: number
		mainPrice: number
		extraPrice: number
		discountPrice: number
		discountQuantity: number
	}[]
	deliveryPrice: number
	deliverySalePrice: number
	totalDiscount: number
}
@Injectable()
export class VoucherService {
	private readonly imageUrl: string
	constructor(
		@InjectModel(MemberRank.name)
		private readonly memberRankModel: Model<MemberRankDocument>,
		@InjectModel(MemberVoucher.name)
		private readonly memberVoucherModel: Model<MemberVoucherDocument>,
		private readonly settingGeneralService: SettingGeneralService,
		private readonly settingMemberAppService: SettingMemberAppService,
		private readonly configService: ConfigService
	) {
		this.imageUrl = configService.get<string>('imageUrl')
	}

	validateVoucherWithCart(condition: VoucherCondition, cart: ValidatedCart) {
		// Validate min quantity
		if (isNumber(condition.minQuantity)) {
			const totalQuantity = cart.products.reduce(
				(res, product) => res + product.quantity,
				0
			)
			if (totalQuantity < condition.minQuantity)
				return {
					error: new Error(
						`Total quantity must be greater or equal to ${condition.minQuantity}`
					),
				}
		}

		// Validate min price
		if (isNumber(condition.minPrice)) {
			const totalRequiredPrice = cart.products.reduce(
				(res, product) =>
					res +
					product.quantity * (product.price + product.requiredOptionPrice),
				0
			)
			if (totalRequiredPrice < condition.minPrice) {
				return {
					error: new Error(
						`Total product price must be greater or equal to ${condition.minPrice} to use this voucher`
					),
				}
			}
		}

		// Validate Shipping method
		if (
			isNumber(condition.shippingMethod) &&
			condition.shippingMethod >= ShippingMethod.IN_STORE &&
			condition.shippingMethod <= ShippingMethod.DELIVERY
		) {
			if (condition.shippingMethod !== cart.shippingMethod)
				return {
					error: new Error(
						`Shipping method must be ${condition.shippingMethod} to use this voucher`
					),
				}
		}

		// Validate Inclusion
		if (condition.inclusion && Array.isArray(condition.inclusion)) {
			let error: Error
			let validOptionalInclusionCount = 0,
				numberOfOptionalInclusion = 0
			const isValid = condition.inclusion.every(detail => {
				if (!detail.required) ++numberOfOptionalInclusion

				let matchProducts = detail.ids.map(id => id.toString())
					? cart.products.filter(
							product =>
								matchProducts.include(product.id.toString()) ||
								matchProducts.include(product.category.toString())
					  )
					: cart.products

				// Check options
				matchProducts = matchProducts.filter(product => {
					return detail.options.every(opts => {
						return opts.split('&').every(itemGroup => {
							return itemGroup
								.split('|')
								.some(itemKey => product.options.includes(itemKey))
						})
					})
				})
				if (matchProducts.length === 0) {
					error = new Error(
						`Cart product is not matched with voucher's condition`
					)
					return !detail.required
				}

				// Check quantity
				if (isNumber(detail.quantity)) {
					const totalQuantity = matchProducts.reduce(
						(res, product) => res + product.quantity,
						0
					)
					if (totalQuantity < detail.quantity) {
						error = new Error(
							`Total quantity${
								detail.ids ? ' of ' + detail.ids : ''
							} must be greater or equal to ${detail.quantity}`
						)
						return !detail.required // False if required, true if optional
					}
				}

				if (!detail.required) {
					++validOptionalInclusionCount
				}
				return true
			})

			if (!isValid) return { error }
			if (validOptionalInclusionCount === 0 && numberOfOptionalInclusion > 0) {
				return {
					error: new Error(
						`Cart product is not matched with voucher's condition`
					),
				}
			}
		}

		return { error: null }
	}

	async applyVoucherToCart(
		memberId: string,
		condition: VoucherCondition,
		discount: VoucherDiscount,
		cart: ValidatedCart
	): Promise<ApplyVoucherResult> {
		const { error } = this.validateVoucherWithCart(condition, cart)
		if (error) {
			throw new BadRequestException(error.message)
		}

		const memberRank = await this.memberRankModel
			.findOne({
				member: new Types.ObjectId(memberId),
			})
			.orFail(new BadRequestException('Member rank not found'))
			.populate<{ rank: Rank }>('rank')
			.lean()
			.exec()

		const result: ApplyVoucherResult = {
			products: cart.products.map(product => ({
				id: product.id,
				category: product.category,
				options: product.options,
				quantity: product.quantity,
				mainPrice: product.price + product.requiredOptionPrice,
				extraPrice: product.optionalOptionPrice,
				discountPrice: 0,
				discountQuantity: 0,
			})),
			deliveryPrice: memberRank.rank.deliveryFee,
			deliverySalePrice: 0,
			totalDiscount: 0,
		}

		const totalMainPrice = result.products.reduce((res, product) => {
			return res + product.quantity * product.mainPrice
		}, 0)

		if (discount?.freeShip) {
			result.deliverySalePrice = result.deliveryPrice
		}
		if (
			Array.isArray(discount?.offerTarget) &&
			discount.offerTarget.length > 0
		) {
			discount.offerTarget.forEach(target => {
				const matchProducts = cart.products
					.map((product, index) => ({ ...product, index }))
					.filter(product => {
						const targetIds = target.ids.map(id => id.toString())
						if (target.ids) {
							if (
								targetIds.includes(product.id.toString()) &&
								targetIds.includes(product.category.toString())
							) {
								return false
							}
						}
						if (!target.options || target.options.length === 0) {
							return true
						}
						return target.options.every(option => {
							return option.split('&').every(itemGroup => {
								return itemGroup
									.split('|')
									.some(itemKey => product.options.includes(itemKey))
							})
						})
					})
				sortBy(
					matchProducts,
					product => product.price + product.requiredOptionPrice
				)

				if (target.buyAndGet) {
					const [buy, get] = target.buyAndGet.split('+').map(v => +v)
					const discountAmount = Math.floor(matchProducts.length / buy) * get
					for (let i = 0; i < discountAmount; i++) {
						result.products[matchProducts[i].index].discountPrice = Math.min(
							result.products[matchProducts[i].index].mainPrice,
							Math.max(
								result.products[matchProducts[i].index].discountPrice,
								target.salePrice
							)
						)
					}
				} else {
					for (
						let count = target.quantity || Infinity, i = 0;
						count > 0 && i < matchProducts.length;
						++i
					) {
						const discountQuantity = Math.min(count, matchProducts[i].quantity)
						const discountAmount =
							discountQuantity *
							(matchProducts[i].price +
								matchProducts[i].requiredOptionPrice -
								target.salePrice)
						if (
							discountAmount >
							result.products[matchProducts[i].index].discountPrice
						) {
							result.products[matchProducts[i].index].discountPrice =
								discountAmount
							result.products[matchProducts[i].index].discountQuantity =
								discountQuantity
						}
						result.products[matchProducts[i].index].discountPrice = Math.max(
							result.products[matchProducts[i].index].discountPrice,
							discountQuantity *
								(matchProducts[i].price +
									matchProducts[i].requiredOptionPrice -
									target.salePrice)
						)
						count = Math.max(0, count - matchProducts[i].quantity)
					}
				}
			})
		} else {
			if (isNumber(discount?.percentage) && discount.percentage >= 0) {
				result.totalDiscount += (totalMainPrice * discount.percentage) / 100
			}
			if (isNumber(discount?.decrease) && discount.decrease >= 0) {
				result.totalDiscount += discount.decrease
			}
			if (isNumber(discount?.salePrice) && discount.salePrice >= 0) {
				result.totalDiscount += totalMainPrice - discount.salePrice
			}
			if (isNumber(discount?.offerAny) && discount.offerAny >= 0) {
				const _products = [...result.products]
				sortBy(_products, product => {
					return product.mainPrice
				})
				for (
					let count = discount.offerAny, i = 0;
					count > 0 && i < _products.length;
					++i
				) {
					if (count < _products[i].quantity) {
						result.totalDiscount += count * _products[i].mainPrice
						count = 0
					} else {
						result.totalDiscount +=
							_products[i].quantity * _products[i].mainPrice
						count -= _products[i].quantity
					}
				}
			}
		}

		return result
	}

	async getUserAvailableVouchers(userId: string) {
		const { defaultImages } = await this.settingMemberAppService.getData<
			Pick<SettingMemberApp, 'defaultImages'>
		>({
			defaultImages: true,
		})
		const now = new Date()

		const [{ brand }, availableVouchers] = await Promise.all([
			this.settingGeneralService.getData<Pick<SettingGeneral, 'brand'>>({
				brand: true,
			}),
			this.memberVoucherModel
				.aggregate<AvailableUserVoucherDTO>([
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
							member: new Types.ObjectId(userId),
							startTime: { $lte: now },
							finishTime: { $gt: now },
							disabled: false,
							$and: [
								{
									$or: [
										{ 'voucher.activeStartTime': null },
										{ 'voucher.activeStartTime': { $lte: now } },
									],
								},
								{
									$or: [
										{ 'voucher.activeFinishTime': null },
										{ 'voucher.activeFinishTime': { $gt: now } },
									],
								},
							],
							'voucher.condition.shippingMethod': {
								$in: [null, ShippingMethod.IN_STORE],
							},
						},
					},
					{
						$lookup: {
							from: 'partners',
							localField: 'partner',
							foreignField: '_id',
							as: 'partner',
						},
					},
					{
						$unwind: {
							path: '$partner',
							preserveNullAndEmptyArrays: true,
						},
					},
					{
						$project: {
							id: '$voucher._id',
							_id: false,
							code: '$voucher.code',
							name: '$voucher.title',
							image: {
								$cond: [
									{
										$regexMatch: {
											input: '$voucher.image',
											regex: s3KeyPattern,
										},
									},
									{ $concat: [this.imageUrl, '$voucher.image'] },
									{ $concat: [this.imageUrl, defaultImages.voucher] },
								],
							},
							partner: '$voucher.partner.name',
							from: { $toLong: '$startTime' },
							to: { $toLong: '$finishTime' },
							description: '$voucher.description',
						},
					},
					{
						$sort: {
							to: 1,
							from: 1,
						},
					},
				])
				.exec(),
		])

		return availableVouchers.map(voucher => ({
			...voucher,
			...(voucher.partner
				? {}
				: {
						partner: brand.name,
				  }),
		}))
	}
}

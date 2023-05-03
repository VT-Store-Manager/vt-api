import { intersection, sortBy } from 'lodash'
import { ClientSession, Model, Types } from 'mongoose'

import { SettingMemberAppService } from '@/app/setting/services/setting-member-app.service'
import {
	ApplyVoucherResult,
	ValidatedCart,
	VoucherMemberService,
} from '@/app/voucher/member-app/voucher_member.service'
import { OrderBuyer, OrderState, PaymentType } from '@/common/constants'
import { MemberRank, MemberRankDocument } from '@/schemas/member-rank.schema'
import {
	MemberVoucher,
	MemberVoucherDocument,
} from '@/schemas/member-voucher.schema'
import { OrderInfoMember } from '@/schemas/order-info-member.schema'
import { OrderInfoReview } from '@/schemas/order-info-review.schema'
import { OrderInfoStore } from '@/schemas/order-info-store.schema'
import { OrderInfoVoucher } from '@/schemas/order-info-voucher.schema'
import { OrderMember, OrderMemberDocument } from '@/schemas/order-member.schema'
import { ProductOptionItem } from '@/schemas/product-option-item.schema'
import {
	ProductOption,
	ProductOptionDocument,
} from '@/schemas/product-option.schema'
import { Product, ProductDocument } from '@/schemas/product.schema'
import { Rank } from '@/schemas/rank.schema'
import { SettingMemberApp } from '@/schemas/setting-member-app.schema'
import { Store, StoreDocument } from '@/schemas/store.schema'
import { Voucher } from '@/schemas/voucher.schema'
import { ArrElement } from '@/types'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import {
	CheckVoucherDTO,
	ShortProductInCartDTO,
} from '../dto/check-voucher.dto'
import { CreateOrderDTO } from '../dto/create-order.dto'
import { ReviewOrderDTO } from '../dto/review-order.dto'

type ShortProductValidationData = {
	_id: string
	name: string
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

type MemberRankShort = {
	member: OrderInfoMember
	rank: Pick<
		Rank,
		| '_id'
		| 'appearance'
		| 'name'
		| 'minPoint'
		| 'coefficientPoint'
		| 'deliveryFee'
	>
}

type ValidatedProduct = ArrElement<ValidatedCart['products']>

@Injectable()
export class OrderMemberService {
	constructor(
		@InjectModel(OrderBuyer.MEMBER)
		private readonly orderMemberModel: Model<OrderMemberDocument>,
		@InjectModel(MemberVoucher.name)
		private readonly memberVoucherModel: Model<MemberVoucherDocument>,
		@InjectModel(MemberRank.name)
		private readonly memberRankModel: Model<MemberRankDocument>,
		@InjectModel(Product.name)
		private readonly productModel: Model<ProductDocument>,
		@InjectModel(Store.name)
		private readonly storeModel: Model<StoreDocument>,
		@InjectModel(ProductOption.name)
		private readonly productOptionModel: Model<ProductOptionDocument>,
		private readonly voucherService: VoucherMemberService,
		private readonly settingMemberAppService: SettingMemberAppService
	) {}

	private async getRelatedDataToCreateOrder(
		memberId: string,
		data: CreateOrderDTO
	) {
		const [
			storeData,
			products,
			productOptions,
			memberRank,
			memberVoucher,
			memberAppSetting,
		] = await Promise.all([
			data.storeId
				? this.storeModel
						.aggregate<
							OrderInfoStore & Pick<Store, 'unavailableGoods' | 'disabled'>
						>([
							{
								$match: {
									_id: new Types.ObjectId(data.storeId),
									deleted: false,
								},
							},
							{
								$addFields: {
									address: {
										$reduce: {
											input: {
												$filter: {
													input: [
														'$address.street',
														'$address.ward',
														'$address.district',
														'$address.city',
														'$address.country',
													],
													as: 'data',
													cond: {
														$and: [
															{
																$ne: ['$$data', ''],
															},
															{
																$ne: ['$$data', null],
															},
														],
													},
												},
											},
											initialValue: '',
											in: {
												$concat: ['$$value', '$$this', ', '],
											},
										},
									},
								},
							},
							{
								$project: {
									id: '$_id',
									_id: false,
									name: true,
									address: {
										$substr: [
											'$address',
											0,
											{
												$add: [{ $strLenCP: '$address' }, -2],
											},
										],
									},
									unavailableGoods: true,
									disabled: true,
								},
							},
						])
						.exec()
				: null,
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
							name: '$name',
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
			this.memberRankModel
				.aggregate<MemberRankShort>([
					{
						$match: {
							member: new Types.ObjectId(memberId),
						},
					},
					{
						$lookup: {
							from: 'ranks',
							localField: 'rank',
							foreignField: '_id',
							as: 'rank',
							pipeline: [
								{
									$project: {
										id: '$_id',
										_id: false,
										name: true,
										appearance: true,
										minPoint: true,
										coefficientPoint: true,
										deliveryFee: true,
									},
								},
							],
						},
					},
					{
						$unwind: {
							path: '$rank',
						},
					},
					{
						$lookup: {
							from: 'members',
							localField: 'member',
							foreignField: '_id',
							as: 'member',
							pipeline: [
								{
									$project: {
										id: '$_id',
										_id: false,
										name: {
											$concat: ['$firstName', ' ', '$lastName'],
										},
										email: '$email',
										phone: '$phone',
									},
								},
							],
						},
					},
					{
						$unwind: {
							path: '$member',
						},
					},
					{
						$project: {
							rank: true,
							member: true,
							_id: false,
						},
					},
					{
						$addFields: {
							'member.rankName': '$rank.name',
						},
					},
				])
				.exec(),
			data.voucherId
				? this.memberVoucherModel
						.aggregate<{
							voucher: OrderInfoVoucher
						}>([
							{
								$match: {
									member: new Types.ObjectId(memberId),
									voucher: new Types.ObjectId(data.voucherId),
								},
							},
							{
								$lookup: {
									from: 'vouchers',
									localField: 'voucher',
									foreignField: '_id',
									as: 'voucher',
									pipeline: [
										{
											$project: {
												id: '$_id',
												_id: false,
												title: '$title',
												code: '$code',
											},
										},
									],
								},
							},
							{
								$unwind: {
									path: '$voucher',
								},
							},
							{
								$project: {
									_id: false,
									member: true,
									voucher: true,
								},
							},
							{
								$addFields: {
									'member.rankName': '',
									'voucher.discountPrice': 0,
								},
							},
						])
						.exec()
				: null,
			this.settingMemberAppService.getData<Pick<SettingMemberApp, 'point'>>({
				point: 1,
			}),
		])

		if (storeData) {
			if (storeData.length === 0) {
				throw new BadRequestException('Store not found')
			}
			if (storeData[0].disabled) {
				throw new BadRequestException('Store is disabled')
			}
		}

		if (memberRank.length === 0) {
			throw new BadRequestException('Member rank not found')
		}

		if (memberVoucher && memberVoucher.length === 0) {
			throw new BadRequestException(`Voucher ${data.voucherId} not found`)
		}

		const result = {
			dtoProductMap: new Map(
				data.products.map(product => [product.id, product])
			),
			store: storeData[0],
			productMap: new Map(
				products.map(product => [product._id.toString(), product])
			),
			optionKeyMap: new Map(
				productOptions.map(option => [option.item.key, option])
			),
			memberRank: memberRank[0],
			memberVoucher: memberVoucher ? memberVoucher[0] : null,
			memberAppSetting,
		}

		if (storeData) {
			if (storeData.length === 0) {
				throw new BadRequestException('Store not found')
			}
			if (storeData[0].disabled) {
				throw new BadRequestException('Store is disabled')
			}
		}

		const validatedProducts = await (data.voucherId
			? this.validateVoucher(memberId, {
					voucherId: data.voucherId,
					categoryId: data.categoryId,
					products: data.products,
					storeId: data.storeId,
			  })
			: this.validateProducts(
					data.products,
					result.productMap,
					result.optionKeyMap,
					result.store.unavailableGoods
			  ))

		return { ...result, validatedProducts }
	}

	private async getRelatedDataToValidateVoucher(
		productIds: Types.ObjectId[],
		memberId: string,
		voucherId: string,
		storeId?: string
	) {
		const now = new Date()
		const [products, productOptions, memberVoucherData, storeData] =
			await Promise.all([
				this.productModel
					.aggregate<ShortProductValidationData>([
						{
							$match: {
								_id: {
									$in: productIds,
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
								name: '$name',
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
				this.memberVoucherModel
					.aggregate<MemberVoucher & { voucher: Voucher }>([
						{
							$match: {
								member: new Types.ObjectId(memberId),
								voucher: new Types.ObjectId(voucherId),
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
				storeId
					? this.storeModel
							.aggregate<
								OrderInfoStore & Pick<Store, 'unavailableGoods' | 'disabled'>
							>([
								{
									$match: {
										_id: new Types.ObjectId(storeId),
										deleted: false,
									},
								},
								{
									$addFields: {
										address: {
											$reduce: {
												input: {
													$filter: {
														input: [
															'$address.street',
															'$address.ward',
															'$address.district',
															'$address.city',
															'$address.country',
														],
														as: 'data',
														cond: {
															$and: [
																{
																	$ne: ['$$data', ''],
																},
																{
																	$ne: ['$$data', null],
																},
															],
														},
													},
												},
												initialValue: '',
												in: {
													$concat: ['$$value', '$$this', ', '],
												},
											},
										},
									},
								},
								{
									$project: {
										id: '$_id',
										_id: false,
										name: true,
										address: {
											$substr: [
												'$address',
												0,
												{
													$add: [{ $strLenCP: '$address' }, -2],
												},
											],
										},
										unavailableGoods: true,
										disabled: true,
									},
								},
							])
							.exec()
					: null,
			])

		if (memberVoucherData.length === 0) {
			throw new BadRequestException(`Member voucher not found`)
		}

		return {
			productMap: new Map(
				products.map(product => [product._id.toString(), product])
			),
			optionKeyMap: new Map(
				productOptions.map(option => [option.item.key, option])
			),
			memberVoucher: memberVoucherData[0],
			store: storeData ? storeData[0] : null,
		}
	}

	async validateVoucher(memberId: string, data: CheckVoucherDTO) {
		const { productMap, optionKeyMap, memberVoucher, store } =
			await this.getRelatedDataToValidateVoucher(
				data.products.map(product => new Types.ObjectId(product.id)),
				memberId,
				data.voucherId,
				data.storeId
			)
		const cartProductPrices = await this.validateProducts(
			data.products,
			productMap,
			optionKeyMap,
			store?.unavailableGoods
		)

		return this.voucherService.applyVoucherToCart(
			memberId,
			memberVoucher.voucher.condition,
			memberVoucher.voucher.discount,
			{
				shippingMethod: data.categoryId,
				products: cartProductPrices,
			}
		)
	}

	async createMemberOrder(
		memberId: string,
		data: CreateOrderDTO,
		session?: ClientSession
	) {
		const {
			dtoProductMap,
			store,
			productMap,
			optionKeyMap,
			memberRank,
			memberVoucher,
			memberAppSetting,
			validatedProducts,
		} = await this.getRelatedDataToCreateOrder(memberId, data)

		const orderItems: Pick<
			OrderMember,
			'items' | 'deliveryDiscount' | 'deliveryPrice' | 'totalProductPrice'
		> = data.voucherId
			? {
					items: (validatedProducts as ApplyVoucherResult).products.reduce(
						(res, product) => {
							const commonData = {
								productId: product.id,
								category: product.category,
								options: product.options,
								unitPrice: product.mainPrice + product.extraPrice,
								name: productMap.get(product.id).name,
								note: [
									dtoProductMap.get(product.id).note,
									...product.options.map(
										key => optionKeyMap.get(key).item.name
									),
								]
									.filter(opt => !!opt)
									.join(', '),
							}
							if (
								!product.discountQuantity ||
								product.discountQuantity === product.quantity
							) {
								return [
									...res,
									{
										...commonData,
										quantity: product.quantity,
										unitSalePrice: product.discountPrice,
									},
								]
							} else {
								return [
									...res,
									{
										...commonData,
										quantity: product.discountQuantity,
										unitSalePrice: product.discountPrice,
									},
									{
										...commonData,
										quantity: product.quantity,
										unitSalePrice: 0,
									},
								]
							}
						},
						[]
					),
					totalProductPrice: (
						validatedProducts as ApplyVoucherResult
					).products.reduce(
						(res, product) =>
							res +
							product.mainPrice +
							product.extraPrice -
							product.discountPrice,
						0
					),
					deliveryPrice: (validatedProducts as ApplyVoucherResult)
						.deliveryPrice,
					deliveryDiscount: (validatedProducts as ApplyVoucherResult)
						.deliverySalePrice,
			  }
			: {
					items: (validatedProducts as ValidatedProduct[]).map(product => ({
						productId: product.id,
						category: product.category,
						options: product.options,
						quantity: product.quantity,
						unitPrice:
							product.price +
							product.requiredOptionPrice +
							product.optionalOptionPrice,
						name: productMap.get(product.id).name,
						note:
							dtoProductMap.get(product.id).note +
							product.options
								.map(key => optionKeyMap.get(key)?.item.name)
								.join(', '),
					})),
					totalProductPrice: (validatedProducts as ValidatedProduct[]).reduce(
						(res, product) =>
							res +
							product.price +
							product.requiredOptionPrice +
							product.optionalOptionPrice,
						0
					),
					deliveryPrice: memberRank.rank.deliveryFee,
			  }

		const orderData: OrderMember = {
			type: data.categoryId,
			buyer: OrderBuyer.MEMBER,
			store: store,
			...orderItems,
			payment: PaymentType.CAST,
			member: memberRank.member,
			voucher: memberVoucher?.voucher || undefined,
			point: await this.calculateOrderPoint(
				orderItems.totalProductPrice,
				memberRank,
				memberAppSetting.point
			),
			receiver: {
				name: data.receiver || memberRank.member.name,
				phone: data.phone || memberRank.member.phone,
				address: data.addressName || store.address,
				timer: data.receivingTime ? new Date(data.receivingTime) : undefined,
			},
		}

		const createdOrder = await this.orderMemberModel.create(
			[
				{
					...orderData,
				},
			],
			session ? { session } : {}
		)

		return createdOrder[0]
	}

	private async validateProducts(
		cartProducts: ShortProductInCartDTO[],
		productMap: Map<string, ShortProductValidationData>,
		optionKeyMap: Map<string, ShortProductOptionValidationData>,
		storeUnavailableGoods?: Store['unavailableGoods']
	) {
		const result = cartProducts.map((validateProduct): ValidatedProduct => {
			const product = productMap.get(validateProduct.id)
			if (!product) {
				throw new BadRequestException(`Product ${validateProduct.id} not found`)
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
		})

		if (storeUnavailableGoods) {
			await this.validateStore(
				storeUnavailableGoods,
				cartProducts,
				productMap,
				optionKeyMap
			)
		}

		return result
	}

	private validateStore(
		unavailableGoods: Store['unavailableGoods'],
		cartProducts: ShortProductInCartDTO[],
		productMap: Map<string, ShortProductValidationData>,
		optionKeyMap: Map<string, ShortProductOptionValidationData>
	) {
		let error: Error
		const validateResult = cartProducts.every(cartProduct => {
			if (
				unavailableGoods.product.findIndex(
					unProductId => unProductId.toString() === cartProduct.id
				) !== -1
			) {
				error = new Error(
					`Product ID ${cartProduct.id} is not available in this store`
				)
				return false
			}

			const { category } = productMap.get(cartProduct.id)
			if (
				unavailableGoods.category.findIndex(
					unCategoryId => unCategoryId.toString() === category
				) !== -1
			) {
				error = new Error(
					`Product category ID ${category} is not available in this store`
				)
				return false
			}

			for (let i = 0; i < cartProduct.options.length; ++i) {
				const { _id: optionId } = optionKeyMap.get(cartProduct.options[i])
				if (
					unavailableGoods.option.findIndex(
						unOptionId => unOptionId.toString() === optionId
					) !== -1
				) {
					error = new Error(
						`Product option ID ${optionId} is not available in this store`
					)
					return false
				}
			}
			return true
		})
		if (!validateResult) {
			throw new BadRequestException(error.message)
		}
		return true
	}

	async calculateOrderPoint(
		orderPrice: number,
		memberRank: MemberRankShort,
		pointSetting: SettingMemberApp['point']
	): Promise<number> {
		let accumulatedPoint = 0

		if (orderPrice >= pointSetting.startMilestone) {
			accumulatedPoint =
				+(orderPrice / pointSetting.unitStep).toFixed(0) *
				pointSetting.pointPerUnit *
				(memberRank.rank.coefficientPoint || 1)
		}

		return accumulatedPoint
	}

	async createOrderReview(
		memberId: string,
		orderId: string,
		data: ReviewOrderDTO,
		session?: ClientSession
	) {
		const orders = await this.orderMemberModel
			.aggregate<Pick<OrderMember, 'state' | 'review'>>([
				{
					$match: {
						_id: new Types.ObjectId(orderId),
						'member.id': new Types.ObjectId(memberId),
					},
				},
				{
					$project: {
						state: true,
						review: true,
					},
				},
			])
			.exec()

		if (!orders || orders.length === 0) {
			throw new BadRequestException('Order not found')
		}
		if (orders[0].state !== OrderState.DONE) {
			throw new BadRequestException(
				`Order with state ${orders[0].state} cannot be reviewed`
			)
		}
		if (orders[0].review && orders[0].review.rate) {
			throw new BadRequestException('Order have already reviewed')
		}

		const orderReview: OrderInfoReview = {
			rate: data.rate,
			content: data.review,
		}

		const updateResult = await this.orderMemberModel.updateOne(
			{ _id: new Types.ObjectId(orderId) },
			{
				review: orderReview,
			},
			session ? { session } : {}
		)

		return updateResult.modifiedCount === 1
	}
}

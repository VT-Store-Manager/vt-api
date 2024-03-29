import { intersection, sortBy, uniq } from 'lodash'
import { ClientSession, Model, Types } from 'mongoose'

import {
	getDistance,
	MomoService,
	OrderBuyer,
	OrderState,
	PaymentType,
	SettingMemberAppService,
	ShippingMethod,
} from '@app/common'
import {
	MemberRank,
	MemberRankDocument,
	MemberVoucher,
	MemberVoucherDocument,
	OrderInfoMember,
	OrderInfoReview,
	OrderInfoStore,
	OrderInfoVoucher,
	OrderMember,
	OrderMemberDocument,
	Product,
	ProductDocument,
	ProductOption,
	ProductOptionDocument,
	ProductOptionItem,
	Rank,
	SettingMemberApp,
	Store,
	StoreDocument,
	TimeLog,
	Voucher,
} from '@app/database'
import { ArrElement } from '@app/types'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import {
	ApplyVoucherResult,
	ValidatedCart,
	VoucherService,
} from '../../voucher/voucher.service'
import {
	CheckVoucherDTO,
	ShortProductInCartDTO,
} from '../dto/check-voucher.dto'
import { CreateOrderDTO } from '../dto/create-order.dto'
import { GetOrderDetailDTO } from '../dto/response.dto'
import { ReviewOrderDTO } from '../dto/review-order.dto'
import { ReviewShipperDTO } from '../dto/review-shipper.dto'
import { OrderStateService } from './order-state.service'

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

type StoreDataType = OrderInfoStore &
	Pick<Store, 'unavailableGoods' | 'openTime'>

@Injectable()
export class OrderService {
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
		private readonly voucherService: VoucherService,
		private readonly settingMemberAppService: SettingMemberAppService,
		private readonly orderStateService: OrderStateService,
		private readonly momoService: MomoService
	) {}

	private async getRelatedDataToCreateOrder(
		memberId: string,
		data: CreateOrderDTO
	) {
		const [
			[storeData],
			products,
			productOptions,
			memberRank,
			memberVoucher,
			memberAppSetting,
		] = await Promise.all([
			data.categoryId !== ShippingMethod.DELIVERY
				? this.storeModel
						.aggregate<StoreDataType>([
							{
								$match: {
									_id: new Types.ObjectId(data.storeId),
									disabled: false,
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
									openTime: true,
									lat: true,
									lng: true,
									unavailableGoods: true,
									disabled: true,
								},
							},
						])
						.exec()
				: this.getNearestStore({ lat: data.addressLat, lng: data.addressLng }),
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
								_id: true,
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
							'member.rankColor': '$rank.appearance.color',
						},
					},
				])
				.exec(),
			data.voucherId
				? this.memberVoucherModel
						.aggregate<
							{
								voucher: OrderInfoVoucher
							} & {
								disabled: boolean
							}
						>([
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
									disabled: true,
								},
							},
							{
								$addFields: {
									'member.rankName': '',
									'voucher.discountPrice': 0,
								},
							},
							{
								$sort: {
									disabled: 1,
								},
							},
						])
						.exec()
				: null,
			this.settingMemberAppService.getData<Pick<SettingMemberApp, 'point'>>({
				point: 1,
			}),
		])

		if (data.categoryId !== ShippingMethod.DELIVERY) {
			if (!storeData) {
				throw new BadRequestException('Store not found')
			}
			const currentTime = new Date()
				.toLocaleTimeString(undefined, { hour12: false })
				.slice(0, 5)
			if (
				(storeData as StoreDataType).openTime.start > currentTime ||
				(storeData as StoreDataType).openTime.end >= currentTime
			) {
				throw new BadRequestException('Store closed')
			}
		} else {
			if (!storeData) {
				throw new BadRequestException('No store is available')
			}
		}

		if (memberRank.length === 0) {
			throw new BadRequestException('Member rank not found')
		}

		if (memberVoucher && memberVoucher.length === 0) {
			throw new BadRequestException(`Voucher ${data.voucherId} not found`)
		}
		if (memberVoucher && memberVoucher[0].disabled) {
			throw new BadRequestException(`Voucher ${data.voucherId} is disabled now`)
		}
		const result = {
			dtoProductMap: new Map(
				data.products.map(product => [product.id, product])
			),
			store: storeData,
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
									_id: true,
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
		if (memberVoucherData[0].voucher.partner) {
			throw new BadRequestException('Cannot use voucher of other brands')
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

	private async getNearestStore(userLocation: { lat: number; lng: number }) {
		const nowTime = new Date()
			.toLocaleTimeString(undefined, { hour12: false })
			.slice(0, 5)
		const allStores = await this.storeModel
			.aggregate<OrderInfoStore & Pick<Store, 'unavailableGoods'>>([
				{
					$addFields: {
						compareOpenTime: {
							$strcasecmp: ['$openTime.start', nowTime],
						},
						compareCloseTime: {
							$strcasecmp: ['$openTime.end', nowTime],
						},
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
					$match: {
						// compareOpenTime: {
						// 	$lte: 0,
						// },
						// compareCloseTime: {
						// 	$eq: 1,
						// },
						deleted: false,
						disabled: false,
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
									$add: [
										{
											$strLenCP: '$address',
										},
										-2,
									],
								},
							],
						},
						unavailableGoods: true,
						lat: true,
						lng: true,
					},
				},
			])
			.exec()
		if (!allStores.length) throw new BadRequestException('No store available')

		const storeCalculatedDistance = allStores.map(store => {
			return {
				...store,
				distance: getDistance(userLocation, { lat: store.lat, lng: store.lng }),
			}
		})

		return sortBy(storeCalculatedDistance, o => o.distance)
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
	): Promise<OrderMember> {
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

		if (data.categoryId !== ShippingMethod.DELIVERY) {
			;(validatedProducts as ApplyVoucherResult).deliveryPrice = 0
			;(validatedProducts as ApplyVoucherResult).deliverySalePrice = 0
		}

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
								note:
									[
										...product.options.map(
											key => optionKeyMap.get(key).item.name
										),
									]
										.filter(opt => !!opt)
										.join(', ') +
									(dtoProductMap.get(product.id).note
										? `\n${dtoProductMap.get(product.id).note}`
										: ''),
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
					totalProductPrice: (validatedProducts as ApplyVoucherResult)
						.totalDiscount
						? (validatedProducts as ApplyVoucherResult).products.reduce(
								(res, product) =>
									res +
									(product.mainPrice + product.extraPrice) * product.quantity,
								0
						  ) - (validatedProducts as ApplyVoucherResult).totalDiscount
						: (validatedProducts as ApplyVoucherResult).products.reduce(
								(res, product) =>
									res +
									(product.mainPrice + product.extraPrice) * product.quantity -
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
							[...product.options.map(key => optionKeyMap.get(key).item.name)]
								.filter(opt => !!opt)
								.join(', ') +
							(dtoProductMap.get(product.id).note
								? `\n${dtoProductMap.get(product.id).note}`
								: ''),
					})),
					totalProductPrice: (validatedProducts as ValidatedProduct[]).reduce(
						(res, product) =>
							res +
							(product.price +
								product.requiredOptionPrice +
								product.optionalOptionPrice) *
								product.quantity,
						0
					),
					deliveryPrice: memberRank.rank.deliveryFee,
			  }

		const voucherDiscountAmount = memberVoucher?.voucher
			? (validatedProducts as ApplyVoucherResult).deliverySalePrice +
			  (validatedProducts as ApplyVoucherResult).totalDiscount
			: 0
		memberVoucher?.voucher &&
			(memberVoucher.voucher.discountPrice = voucherDiscountAmount)

		const orderData: OrderMember = {
			type: data.categoryId,
			buyer: OrderBuyer.MEMBER,
			store: store,
			...orderItems,
			payment: data.payType,
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
				lat: data.addressLat,
				lng: data.addressLng,
			},
			timeLog: [
				{
					time: new Date(),
					state: OrderState.PENDING,
					...(data.payType === PaymentType.CAST
						? {
								title: 'Chờ xác nhận',
								description: 'Chờ cửa hàng xác nhận đơn hàng',
						  }
						: {
								title: 'Chờ thanh toán',
								description: 'Thực hiện thanh toán để hoàn thành đặt đơn hàng',
						  }),
				},
			],
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
		// Convert option item key from parent key to child keys
		cartProducts = cartProducts.map(product => {
			const productData = productMap.get(product.id)
			const childKeyMap = productData.options
				.reduce((res, option) => {
					return [...res, ...option.items]
				}, [] as ShortProductValidationData['options'][number]['items'])
				.filter(item => item.parentKey)
				.reduce((res, item) => {
					res[item.parentKey] = item.key
					return res
				}, {} as Record<string, string>)
			product.options = product.options.map(selectedOptionKey => {
				return childKeyMap[selectedOptionKey] ?? selectedOptionKey
			})
			return product
		})

		// Start calculate product option price
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
					option.items.map(item => item.key || item.parentKey),
					validateProduct.options
				)
				if (option.disabled || option.deleted) {
					return
				}
				if (selectedKeys.length < option.range[0]) {
					throw new BadRequestException(
						`Option ${option._id.toString()} must contain more than ${
							option.range[0]
						} item`
					)
				}
				if (selectedKeys.length > option.range[1]) {
					throw new BadRequestException(
						`Option ${option._id.toString()} must contain less than ${
							option.range[1]
						} item`
					)
				}

				const selectedKeysData = selectedKeys.map(key => optionKeyMap.get(key))

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
		const [orders, { point }] = await Promise.all([
			this.orderMemberModel
				.aggregate<
					Pick<OrderMember, 'state' | 'review'> & { productIds: string[] }
				>([
					{
						$match: {
							_id: new Types.ObjectId(orderId),
							'member.id': new Types.ObjectId(memberId),
						},
					},
					{
						$project: {
							productIds: {
								$map: {
									input: '$items',
									as: 'item',
									in: { $toString: '$$item.productId' },
								},
							},
							state: true,
							review: true,
						},
					},
				])
				.exec(),
			this.settingMemberAppService.getData({ point: true }),
		])

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
		const order = orders[0]

		const likeItems = uniq(data.like ?? []).filter(id =>
			order.productIds.includes(id)
		)
		const dislikeItems = uniq(data.dislike ?? []).filter(
			id => order.productIds.includes(id) && !likeItems.includes(id)
		)

		const orderReview: OrderInfoReview = {
			rate: data.rate,
			content: data.review,
			likeItems,
			dislikeItems,
		}

		const [updateResult, _] = await Promise.all([
			this.orderMemberModel.updateOne(
				{ _id: new Types.ObjectId(orderId) },
				{
					review: orderReview,
				},
				session ? { session } : {}
			),
			this.memberRankModel
				.updateOne(
					{ member: new Types.ObjectId(memberId) },
					{ $inc: { currentPoint: point.reviewBonus } }
				)
				.exec(),
		])

		return updateResult.modifiedCount === 1
	}

	async createShipperReview(
		memberId: string,
		orderId: string,
		data: ReviewShipperDTO,
		session?: ClientSession
	) {
		const [order, { point }] = await Promise.all([
			this.orderMemberModel
				.findOne({
					_id: new Types.ObjectId(orderId),
					'member.id': new Types.ObjectId(memberId),
				})
				.orFail(new BadRequestException('Order not found'))
				.select('type state shipper')
				.lean()
				.exec(),
			this.settingMemberAppService.getData({ point: true }),
		])

		if (order.type !== ShippingMethod.DELIVERY) {
			throw new BadRequestException('Only review shipper in delivery order')
		}
		if (order.state !== OrderState.DONE) {
			throw new BadRequestException('Only review when order is done')
		}
		if (!order.shipper || !order.shipper.id) {
			throw new BadRequestException('Not have shipper data for reviewing')
		}
		if (order.shipper.review) {
			throw new BadRequestException("Shipper's order is reviewed")
		}

		const updateResult = await this.orderMemberModel.updateOne(
			{ _id: new Types.ObjectId(orderId) },
			{
				$set: {
					shipper: {
						review: {
							rate: data.rate,
							content: data.review,
						},
					},
				},
			},
			session ? { session } : {}
		)
		this.memberRankModel.updateOne(
			{ member: new Types.ObjectId(memberId) },
			{
				$inc: { currentPoint: point.reviewShipperBonus },
			}
		)

		return updateResult.modifiedCount === 1
	}

	async getOrderDetail(
		memberId: string,
		orderId: string
	): Promise<GetOrderDetailDTO> {
		const [orders, setting] = await Promise.all([
			this.orderMemberModel
				.aggregate<GetOrderDetailDTO & { itemNames: string[] }>([
					{
						$match: {
							_id: new Types.ObjectId(orderId),
							'member.id': new Types.ObjectId(memberId),
						},
					},
					{
						$project: {
							id: '$_id',
							_id: false,
							code: true,
							name: '',
							itemNames: {
								$map: {
									input: '$items',
									as: 'item',
									in: '$$item.name',
								},
							},
							categoryId: '$type',
							fee: {
								$subtract: ['$deliveryPrice', '$deliveryDiscount'],
							},
							originalFee: '$deliveryPrice',
							cost: {
								$sum: [
									'$totalProductPrice',
									{ $subtract: ['$deliveryPrice', '$deliveryDiscount'] },
								],
							},
							payType: '$payment',
							time: { $toLong: '$createdAt' },
							phone: '$receiver.phone',
							receiver: '$receiver.name',
							voucherId: '$voucher.id',
							voucherDiscount: '$voucher.discountPrice',
							voucherName: '$voucher.title',
							addressName: '$receiver.address',
							products: {
								$map: {
									input: '$items',
									as: 'item',
									in: {
										id: '$$item.productId',
										name: '$$item.name',
										cost: {
											$subtract: ['$$item.unitPrice', '$$item.unitSalePrice'],
										},
										amount: '$$item.quantity',
										note: '$$item.note',
										options: '$$item.options',
									},
								},
							},
							'review.rate': '$review.rate',
							'review.review': '$review.content',
							'review.likeItems': '$review.likeItems',
							'review.dislikeItems': '$review.dislikeItems',
							'reviewShipper.rate': '$shipper.review.rate',
							'reviewShipper.review': '$shipper.review.content',
							point: '$point',
							status: '$state',
							timeLog: {
								$map: {
									input: '$timeLog',
									as: 'log',
									in: {
										time: { $toLong: '$$log.time' },
										title: '$$log.title',
										description: '$$log.description',
									},
								},
							},
						},
					},
				])
				.exec(),
			this.settingMemberAppService.getData({ point: true }),
		])

		if (!orders || orders.length === 0) {
			throw new BadRequestException('Order not found')
		}
		const order = orders[0]
		if (order.payType === PaymentType.MOMO) {
			order.isPaid = await this.momoService.checkOrderPayment(orderId)
		}

		order.name = (() => {
			const nameSet = uniq(order.itemNames)
			if (nameSet.length < 3) {
				return nameSet.slice(0, 2).join(', ')
			} else {
				return `${nameSet.slice(0, 2).join(', ')} +${
					nameSet.length - 2
				} sản phẩm khác`
			}
		})()
		order.time = new Date(order.time).getTime()
		order.reviewPoint = setting.point.reviewBonus
		order.reviewShipperPoint = setting.point.reviewShipperBonus

		delete order.itemNames

		return order
	}

	async cancelOrder(memberId: string, orderId: string) {
		const order = await this.orderMemberModel
			.findOne({
				_id: new Types.ObjectId(orderId),
				'member.id': new Types.ObjectId(memberId),
			})
			.orFail(new BadRequestException('Order not found'))
			.select('state')
			.lean()
			.exec()

		if (order.state !== OrderState.PENDING) {
			throw new BadRequestException('Cannot cancel processing order')
		}

		const updateResult = await this.orderMemberModel
			.updateOne(
				{ _id: new Types.ObjectId(orderId) },
				{
					$set: { state: OrderState.CANCELED },
					$push: {
						timeLog: {
							time: new Date(),
							title: this.orderStateService
								.getAllOrderStates()
								.find(state => state.id === OrderState.CANCELED).name,
							description: 'Đơn hàng bị huỷ bởi người đặt',
							state: OrderState.CANCELED,
						} as TimeLog,
					},
				}
			)
			.exec()

		return updateResult.modifiedCount === 1
	}
}

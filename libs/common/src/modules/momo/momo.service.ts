import { createHmac } from 'crypto'
import { findLast, uniq } from 'lodash'
import { FilterQuery, Model, Types } from 'mongoose'
import { SoftDeleteModel } from 'mongoose-delete'

import {
	AppVersion,
	MomoResultCode,
	OrderBuyer,
	PaymentStatus,
	validatePayload,
} from '@app/common'
import { EnvConfigType } from '@app/config'
import {
	Member,
	MemberDocument,
	MomoPayment,
	MomoPaymentDocument,
	Order,
	OrderDocument,
	OrderInfoMember,
	OrderMember,
	OrderMemberDocument,
	TimeLog,
} from '@app/database'
import { HttpService } from '@nestjs/axios'
import {
	BadGatewayException,
	BadRequestException,
	Injectable,
	Logger,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'

import { GetOrderDetailDTO } from '@client/src/order/dto/response.dto'
import {
	createPaymentSignatureKeys,
	MomoCreatePayment,
} from './models/create-payment.model'
import { MomoCreatePaymentResponse } from './models/create-payment-response.model'
import { firstValueFrom } from 'rxjs'
import {
	MomoProcessPaymentResult,
	processPaymentResultSignatureKeys,
} from './models/processing-payment-result.model'
import {
	MomoCheckTransactionStatusModel,
	CheckTransactionStatusResultModel,
	checkTransactionStatusSignatureKeys,
} from './models/check-transaction-status.model'

@Injectable()
export class MomoService {
	private baseUrl: string
	private partnerCode: string
	private accessKey: string
	private secretKey: string
	private saleAppUrl: string

	constructor(
		private readonly httpService: HttpService,
		private readonly configService: ConfigService<EnvConfigType>,
		@InjectModel(Order.name)
		private readonly orderModel: Model<OrderDocument>,
		@InjectModel(OrderBuyer.MEMBER)
		private readonly orderMemberModel: Model<OrderMemberDocument>,
		@InjectModel(Member.name)
		private readonly memberModel: SoftDeleteModel<MemberDocument>,
		@InjectModel(MomoPayment.name)
		private readonly momoPaymentModel: Model<MomoPaymentDocument>
	) {
		const momoConfig = this.configService.get('momo', {
			infer: true,
		})
		this.baseUrl = momoConfig.baseUrl
		this.partnerCode = momoConfig.partnerCode
		this.accessKey = momoConfig.accessKey
		this.secretKey = momoConfig.secretKey
		this.saleAppUrl = this.configService.get('app.saleUrl', { infer: true })
	}

	private generateSignature<T extends any[] = string[]>(
		data: Record<Exclude<T[number], 'accessKey'>, any>,
		signatureKeys: T
	): string {
		Object.assign(data, { accessKey: this.accessKey })

		const rawSignature = signatureKeys
			.map(key => `${key}=${data[key]}`)
			.join('&')
		const signature = createHmac('sha256', this.secretKey)
			.update(rawSignature)
			.digest('hex')

		return signature
	}

	validateSignature<T extends any[] = string[]>(
		data: Record<Exclude<T[number], 'accessKey'>, any>,
		signatureKeys: T,
		validateSignature: string,
		exception?: Error
	): boolean {
		const signature = this.generateSignature(data, signatureKeys)

		const isMatched = validateSignature === signature
		if (!isMatched && exception) throw exception

		return isMatched
	}

	async getPaymentPayment(
		orderId: string,
		memberId: string,
		initPayload: Pick<MomoCreatePayment, 'redirectUrl' | 'lang'>
	): Promise<MomoCreatePayment> {
		const [momoPayments, [orderDetail]] = await Promise.all([
			this.momoPaymentModel
				.aggregate<MomoPayment>([
					{
						$match: { cartOrderId: new Types.ObjectId(orderId) },
					},
				])
				.exec(),
			this.orderMemberModel
				.aggregate<
					Pick<OrderMember, 'code' | 'store' | 'receiver'> & {
						name: string
						itemNames: string[]
						cost: number
						products: GetOrderDetailDTO['products']
						fee: number
						member: OrderInfoMember
					}
				>([
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
							store: true,
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
							member: true,
							payType: '$payment',
							time: { $toLong: '$createdAt' },
							phone: '$receiver.phone',
							receiver: true,
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
							status: '$state',
						},
					},
				])
				.exec(),
		])

		if (!orderDetail) throw new BadRequestException('Order not found')
		if (momoPayments.length) {
			if (
				momoPayments.some(payment => payment.status === PaymentStatus.SUCCESS)
			)
				throw new BadRequestException('Order payment is succeed before')
			const pendingPayment = findLast(
				momoPayments,
				payment => payment.status === PaymentStatus.PENDING
			)
			if (pendingPayment) {
				Object.assign(initPayload, {
					requestId: pendingPayment.requestId,
					orderId: pendingPayment.orderId,
				} as Partial<MomoCreatePayment>)
			}
		}
		orderDetail.name = (() => {
			const nameSet = uniq(orderDetail.itemNames)
			if (nameSet.length < 3) {
				return nameSet.slice(0, 2).join(', ')
			} else {
				return `${nameSet.slice(0, 2).join(', ')} +${
					nameSet.length - 2
				} sản phẩm khác`
			}
		})()

		const requestId = `${orderDetail.code}_${Date.now()}`

		const createPaymentPayload: MomoCreatePayment = {
			partnerCode: this.partnerCode,
			storeName: orderDetail.store.name,
			storeId: orderDetail.store.id.toString(),
			requestId,
			amount: orderDetail.cost,
			orderId: requestId,
			orderInfo: orderDetail.name,
			redirectUrl: '', // override by redirectUrl in initPayload
			ipnUrl: `${this.saleAppUrl}/api/v${AppVersion.SALE}/momo/${orderId}/ipn`,
			requestType: 'captureWallet',
			extraData: '',
			items: orderDetail.products.map(product => {
				return {
					id: product.id.toString(),
					name: product.name,
					price: product.cost,
					currency: 'VND',
					quantity: product.amount,
					totalAmount: product.cost * product.amount,
					purchaseAmount: product.cost * product.amount,
				}
			}),
			deliveryInfo: {
				deliveryAddress:
					orderDetail.receiver?.address || orderDetail.store.address,
				deliveryFee: orderDetail.fee.toString(),
				quantity: orderDetail.products
					.reduce((sum, product) => sum + product.amount, 0)
					.toString(),
			},
			userInfo: {
				name: orderDetail.member.name,
				phoneNumber: orderDetail.member.phone,
				email: orderDetail.member.email,
			},
			lang: 'en',
			signature: '',
			...initPayload,
		}
		createPaymentPayload.signature = this.generateSignature(
			createPaymentPayload,
			createPaymentSignatureKeys
		)

		const validateErrors = await validatePayload(
			createPaymentPayload,
			MomoCreatePayment
		)

		if (validateErrors.length > 0) {
			throw validateErrors
		}

		return createPaymentPayload
	}

	async createMomoPayment(payload: MomoCreatePayment, orderId: string) {
		const createResultObservable =
			this.httpService.post<MomoCreatePaymentResponse>(
				'/v2/gateway/api/create',
				payload,
				{ baseURL: this.baseUrl }
			)
		const createResult = await firstValueFrom(createResultObservable)
		Logger.verbose(`Waiting IPN callback: ${payload.ipnUrl}`, 'MomoIPN')

		this.momoPaymentModel.create<MomoPayment>({
			cartOrderId: new Types.ObjectId(orderId),
			requestId: createResult.data.requestId,
			orderId: createResult.data.orderId,
		})

		return createResult
	}

	async updatePaymentResult(
		payload: MomoProcessPaymentResult,
		orderId: string
	): Promise<MomoPayment> {
		const filterQuery: FilterQuery<MomoPayment> = {
			requestId: payload.requestId,
			orderId: payload.orderId,
		}
		const [isPaidOrder, paymentData] = await Promise.all([
			this.momoPaymentModel
				.exists({
					cartOrderId: new Types.ObjectId(orderId),
					status: PaymentStatus.SUCCESS,
				})
				.exec(),
			this.momoPaymentModel.findOne(filterQuery).lean().exec(),
		])
		if (
			isPaidOrder ||
			(paymentData && paymentData.status === PaymentStatus.SUCCESS)
		) {
			throw new BadGatewayException('Payment is done before')
		}

		const isValid = this.validateSignature(
			payload,
			processPaymentResultSignatureKeys,
			payload.signature
		)
		if (!isValid) {
			Logger.error('Momo payment signature is incorrect', 'MomoIPN')
			throw new BadGatewayException('Signature is incorrect')
		}

		const updateFields: Partial<MomoPayment> = {
			transId: payload.transId,
			resultCode: payload.resultCode,
			message: payload.message,
			status: [
				MomoResultCode.SUCCEEDED,
				MomoResultCode.AUTHORIZED_SUCCESSFULLY,
			].includes(payload.resultCode)
				? PaymentStatus.SUCCESS
				: PaymentStatus.FAILED,
		}

		this.orderModel
			.updateOne(
				{
					_id: new Types.ObjectId(orderId),
				},
				{
					$push: {
						timeLog: {
							time: new Date(),
							title:
								updateFields.status === PaymentStatus.SUCCESS
									? 'Thanh toán thành công'
									: 'Thanh toán thất bại',
						} as TimeLog,
					},
				}
			)
			.exec()

		if (paymentData) {
			const updatedData = await this.momoPaymentModel.findOneAndUpdate(
				filterQuery,
				updateFields
			)
			return updatedData
		} else {
			const createdData = await this.momoPaymentModel.create<MomoPayment>({
				cartOrderId: new Types.ObjectId(orderId),
				requestId: payload.requestId,
				orderId: payload.orderId,
				...updateFields,
			})
			return createdData
		}
	}

	async checkTransactionStatus(
		orderId: string,
		memberId: string,
		initPayload: Partial<Pick<MomoCheckTransactionStatusModel, 'lang'>> = {}
	): Promise<CheckTransactionStatusResultModel | false> {
		const [paymentData, isValidOrder] = await Promise.all([
			this.momoPaymentModel
				.findOne({
					cartOrderId: new Types.ObjectId(orderId),
				})
				.lean()
				.exec(),
			this.orderMemberModel
				.exists({
					'member.id': new Types.ObjectId(memberId),
					_id: new Types.ObjectId(orderId),
				})
				.exec(),
		])

		if (!isValidOrder) throw new BadRequestException('Order not found')
		if (!paymentData) return false

		const payload: MomoCheckTransactionStatusModel = {
			partnerCode: this.partnerCode,
			requestId: paymentData.requestId,
			orderId: paymentData.orderId,
			lang: initPayload.lang || 'en',
			signature: '',
		}
		payload.signature = this.generateSignature(
			payload,
			checkTransactionStatusSignatureKeys
		)

		const validateErrors = await validatePayload(
			payload,
			MomoCheckTransactionStatusModel
		)

		if (validateErrors.length > 0) {
			throw validateErrors
		}

		const transactionStatusResponse = await firstValueFrom(
			this.httpService.post<CheckTransactionStatusResultModel>(
				'/v2/gateway/api/query',
				payload,
				{ baseURL: this.baseUrl }
			)
		)

		return transactionStatusResponse.data
	}

	async checkOrderPayment(orderId: string): Promise<boolean> {
		const successPaymentCount = await this.momoPaymentModel.count({
			cartOrderId: new Types.ObjectId(orderId),
			status: PaymentStatus.SUCCESS,
		})

		return successPaymentCount > 0
	}
}

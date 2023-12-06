import { uniq } from 'lodash'

export class MomoProcessPaymentResult {
	partnerCode: string
	orderId: string
	requestId: string
	amount: number
	partnerUserId?: string
	orderInfo: string
	orderType = 'momo_wallet'
	transId: number
	resultCode: number
	message: string
	payType: 'webApp' | 'app' | 'qr' | 'miniapp'
	responseTime: number
	extraData = ''
	signature: string
	paymentOption?: 'momo' | 'pay_later'
}

export const processPaymentResultSignatureKeys = uniq([
	'accessKey',
	'amount',
	'extraData',
	'message',
	'orderId',
	'orderInfo',
	'orderType',
	'partnerCode',
	'payType',
	'requestId',
	'responseTime',
	'resultCode',
	'transId',
] as const).sort()

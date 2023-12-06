import { uniq } from 'lodash'

export class MomoCreatePaymentResponse {
	partnerCode: string
	requestId: string
	orderId: string
	amount: number
	responseTime: number
	message: string
	resultCode: number
	payUrl: string
	deeplink?: string
	qrCodeUrl?: string
	deeplinkMiniApp?: string
	signature?: string
}

export const createPaymentResponseSignatureKeys = uniq([
	'accessKey',
	'amount',
	'message',
	'orderId',
	'partnerCode',
	'payUrl',
	'requestId',
	'responseTime',
	'resultCode',
] as const).sort()

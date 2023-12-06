import { IsString, IsNotEmpty, MaxLength, Matches, IsIn } from 'class-validator'
import { uniq } from 'lodash'

export class MomoCheckTransactionStatusModel {
	@IsString()
	partnerCode: string

	@IsString()
	@IsNotEmpty()
	@MaxLength(50)
	requestId: string

	@IsString()
	@Matches(/^[0-9a-zA-Z]([-_.]*[0-9a-zA-Z]+)*$/)
	orderId: string

	@IsIn(['vi', 'en'] as const)
	lang: 'vi' | 'en'

	@IsString()
	@Matches(/^[a-z0-9]{64}$/) // Hmac_SHA256
	signature: string
}

export const checkTransactionStatusSignatureKeys = uniq([
	'accessKey',
	'orderId',
	'partnerCode',
	'requestId',
] as const).sort()

export class CheckTransactionStatusResultModel {
	partnerCode: string
	requestId: string
	orderId: string
	extraData = ''
	amount: number
	transId: number
	payType: 'web' | 'qr'
	resultCode: number
	refundTrans: any[]
	message: string
	responseTime: number
	signature: string
	paymentOption?: 'momo' | 'pay_later'
}

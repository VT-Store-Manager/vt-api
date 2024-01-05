import {
	IsIn,
	IsNotEmpty,
	IsOptional,
	IsPositive,
	IsString,
	Matches,
	MaxLength,
} from 'class-validator'
import uniq from 'lodash/uniq'

export class RefundTransactionRequestModel {
	@IsString()
	partnerCode: string

	@IsOptional()
	@IsString()
	subPartnerCode?: string

	@IsString()
	orderId: string

	@IsString()
	@IsNotEmpty()
	@MaxLength(50)
	requestId: string

	@IsPositive()
	amount: number

	@IsPositive()
	transId: number

	@IsIn(['vi', 'en'] as const)
	lang: string

	@IsOptional()
	@IsString()
	description: string

	@IsString()
	@Matches(/^[a-z0-9]{64}$/) // Hmac_SHA256
	signature: string
}

export const refundTransactionRequestSignatureKeys = uniq([
	'accessKey',
	'amount',
	'description',
	'orderId',
	'partnerCode',
	'requestId',
	'transId',
] as const).sort()

export class RefundTransactionResultModel {
	partnerCode?: string
	orderId?: string
	requestId?: string
	amount?: number
	transId?: number
	resultCode: number
	message: string
	responseTime: number
}

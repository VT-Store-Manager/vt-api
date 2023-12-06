import { Type } from 'class-transformer'
import {
	ArrayMaxSize,
	IsArray,
	IsBase64,
	IsBoolean,
	IsIn,
	IsNotEmpty,
	IsNumber,
	IsObject,
	IsOptional,
	IsPositive,
	IsString,
	IsUrl,
	Matches,
	Max,
	MaxLength,
	Min,
	ValidateNested,
} from 'class-validator'
import { uniq } from 'lodash'

export class MomoPaymentItem {
	@IsString()
	@IsNotEmpty()
	id: string

	@IsString()
	@IsNotEmpty()
	name: string

	@IsOptional()
	@IsString()
	description?: string

	@IsOptional()
	@IsString()
	category?: string

	@IsOptional()
	@IsUrl()
	imageUrl?: string

	@IsString()
	@IsNotEmpty()
	currency: 'VND'

	@Type(() => Number)
	@IsPositive()
	quantity: number

	@Type(() => Number)
	@IsPositive()
	totalAmount: number

	@Type(() => Number)
	@IsPositive()
	purchaseAmount: number

	@IsOptional()
	@IsString()
	manufacturer?: string

	@IsOptional()
	@IsString()
	unit?: string

	@IsOptional()
	@Type(() => Number)
	@IsPositive()
	taxAmount?: string
}

export class MomoDeliveryInfo {
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	deliveryAddress?: string

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	deliveryFee?: string

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	quantity?: string
}

export class MomoUserInfo {
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	name?: string

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	phoneNumber?: string

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	email?: string
}

export class MomoCreatePayment {
	@IsString()
	partnerCode: string

	@IsOptional()
	@IsString()
	subPartnerCode?: string

	@IsOptional()
	@IsString()
	storeName?: string

	@IsOptional()
	@IsString()
	storeId?: string

	@IsString()
	@IsNotEmpty()
	@MaxLength(50)
	requestId: string

	@IsNumber()
	@Type(() => Number)
	@Min(1000)
	@Max(50000000)
	amount: number

	@IsString()
	@Matches(/^[0-9a-zA-Z]([-_.]*[0-9a-zA-Z]+)*$/)
	orderId: string

	@IsString()
	orderInfo: string

	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	orderGroupId?: number

	@IsString()
	redirectUrl = ''

	@IsString()
	ipnUrl: string

	@IsString()
	requestType: 'captureWallet'

	@IsBase64()
	extraData = ''

	@IsOptional()
	@IsArray()
	@ArrayMaxSize(50)
	@Type(() => MomoPaymentItem)
	@ValidateNested({ each: true })
	items?: MomoPaymentItem[]

	@IsOptional()
	@IsObject()
	@Type(() => MomoDeliveryInfo)
	@ValidateNested()
	deliveryInfo?: MomoDeliveryInfo

	@IsOptional()
	@Type(() => MomoUserInfo)
	@ValidateNested()
	userInfo?: MomoUserInfo

	@IsOptional()
	@IsString()
	referenceId?: string

	@IsOptional()
	@Type(() => Boolean)
	@IsBoolean()
	autoCapture?: boolean

	@IsIn(['vi', 'en'] as const)
	lang: 'vi' | 'en'

	@IsString()
	@Matches(/^[a-z0-9]{64}$/) // Hmac_SHA256
	signature: string
}

export const createPaymentSignatureKeys = uniq([
	'accessKey',
	'amount',
	'extraData',
	'ipnUrl',
	'orderId',
	'orderInfo',
	'partnerCode',
	'redirectUrl',
	'requestId',
	'requestType',
] as const).sort()

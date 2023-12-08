import { OrderState, PaymentType, ShippingMethod } from '@app/common'
import { TimeLog } from '@app/database'
import { OmitType } from '@nestjs/swagger'

export class GetProductPriceApplyingVoucherDTO {
	fee: number
	originalFee: number
	cost: number
	voucherDiscount: number
	products: ProductWithCostDTO[]
}

class ProductWithCostDTO {
	id: string
	cost: number
}

export class CreateOrderResponseDTO {
	id: string
}

export class OrderByStateResultDTO {
	maxCount: number
	carts: OrderCartItemDTO[]
}

export class OrderCartItemDTO {
	id: string
	name: string
	payType: PaymentType
	given?: number
	cost: number
	time: number
	rate?: number
	phone: string
	voucherName?: string
	username?: string
	products: OrderProductItemDTO[]
}

export class OrderStateItemDTO {
	id: string
	name: string
}

export class GetOrderDetailDTO {
	id: string
	code: string
	name: string
	categoryId: ShippingMethod
	fee: number
	originalFee: number
	cost: number
	payType: PaymentType
	isPaid?: boolean
	time: number
	voucher?: OrderVoucherInfo
	member?: OrderMemberInfo
	receiver?: OrderReceiverInfo
	products: OrderProductItemDTO[]
	review?: OrderReviewDTO
	reviewShipper?: OrderReviewShipperDTO
	point: number
	statusId: OrderState
	timeLog: OrderTimeLog[]
	employee?: OrderEmployeeInfo
	shipper?: OrderShipperInfo
}

export class OrderVoucherInfo {
	id: string
	discount: number
	name: string
}

export class OrderMemberInfo {
	id: string
	phone: string
	name: string
	rankName: string
	rankColor: string
}

export class OrderReceiverInfo {
	name: string
	phone: string
	addressName: string
	lat: number
	lng: number
}

export class OrderProductItemDTO {
	id: string
	name: string
	cost: number
	amount: number
	note: string
	options: string[]
}

export class OrderReviewDTO {
	rate: number
	review: string
	like: string[]
	dislike: string[]
}

export class OrderTimeLog extends OmitType(TimeLog, ['time'] as const) {
	time: number
}

export class OrderReviewShipperDTO {
	rate: number
	review: string
}

export class OrderEmployeeInfo {
	id: string
	phone: string
	name: string
	avatar: string
	isDeleted: boolean
}

export class OrderShipperInfo {
	id: string
	phone: string
	name: string
	avatar: string
	isDeleted: boolean
}

export class SuggestVoucherItemDTO {
	voucherId: string
	cost: number
	voucherDiscount: number
	products: SuggestVoucherProductItemDTO[]
}

export class SuggestVoucherProductItemDTO {
	id: string
	cost: number
	discount: number
}

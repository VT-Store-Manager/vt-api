import { OrderState, PaymentType, ShippingMethod } from '@app/common'
import { Order, OrderMember } from '@app/database'
import { OmitType, PickType } from '@nestjs/swagger'

export class GetOrderDetailDTO extends PickType(OrderMember, [
	'store',
	'member',
]) {
	id: string
	code: string
	name: string
	categoryId: ShippingMethod
	fee: number
	originalFee: number
	cost: number
	payType: PaymentType
	time: number
	receiver?: OrderReceiverDTO
	voucher?: OrderVoucherDTO
	products: OrderProductItemDTO[]
	review: OrderReviewDTO
	point: number
	status: OrderState
}

export class OrderReceiverDTO {
	phone: string
	name: string
	address: string
}

export class OrderVoucherDTO {
	id: string
	discount: number
	name: string
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
}

export class OrderDetailDTO extends OmitType(Order, ['buyer', '_id'] as const) {
	id: string
}

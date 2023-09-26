import { OrderState, PaymentType, ShippingMethod } from '@app/common'

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

export class CreateOrderDTO {
	id: string
}

export class OrderByStateResultDTO {
	maxCount: number
	carts: OrderCartItemDTO[]
}

export class OrderCartItemDTO {
	id: string
	name: string
	categoryId: ShippingMethod
	cost: number
	time: number
	rate?: number
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
	time: number
	phone: string
	receiver: string
	voucherId: string
	voucherDiscount: number
	voucherName: string
	addressName: string
	products: OrderProductItemDTO[]
	review: OrderReviewDTO
	point: number
	status: OrderState
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

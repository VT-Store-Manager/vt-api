import { PaymentType } from '@app/common'
import { PickType } from '@nestjs/swagger'

export class OrderListPaginationResultDTO {
	maxCount: number
	data: OrderShortDTO[]
}

export class OrderDetailDTO {
	id: string
	code: string
	items: OrderItemDTO[]
	quantity: number
	totalPrice: number
	shippingFee: number
	paymentType: PaymentType
	receiver: OrderReceiverDTO
	store: OrderStoreDTO
	timelines: OrderTimeLogDTO[]
	review?: OrderReviewShipperDTO
	createdAt: number
}

export class OrderShortDTO extends PickType(OrderDetailDTO, [
	'id',
	'receiver',
	'store',
	'paymentType',
	'totalPrice',
	'shippingFee',
	'createdAt',
	'quantity',
] as const) {}

export class OrderItemDTO {
	id: string
	name: string
	amount: number
	note: string
}

export class OrderReceiverDTO {
	name: string
	phone: string
	address: string
	lat: number
	lng: number
}

export class OrderStoreDTO {
	name: string
	phone: string
	address: string
	lat: number
	lng: number
}

export class OrderTimeLogDTO {
	time: number
	title: string
	description?: string
}

export class OrderReviewShipperDTO {
	rate: number
	description?: string
}

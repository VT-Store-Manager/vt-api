import { PaymentType } from '@app/common'

export class OrderListPaginationResultDTO {
	maxCount: number
	data: OrderDetailDTO[]
}

export class OrderDetailDTO {
	id: string
	code: string
	items: OrderItemDTO[]
	totalPrice: number
	shippingFee: number
	paymentType: PaymentType
	receiver: OrderReceiverDTO
	store: OrderStoreDTO
	timelines: OrderTimeLogDTO[]
	review?: OrderReviewShipperDTO
}

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

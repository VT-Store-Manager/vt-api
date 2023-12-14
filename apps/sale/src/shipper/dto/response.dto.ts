import { Shipper } from '@app/database'
import { PaymentType } from '@app/common'
import { PickType } from '@nestjs/swagger'

export class OrderListPaginationResultDTO {
	maxCount: number
	orders: OrderShortDTO[]
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
	shipDistance: number
	timelines: OrderTimeLogDTO[]
	review?: OrderReviewShipperDTO
	createdAt: number
}

export class OrderShortDTO extends PickType(OrderDetailDTO, [
	'id',
	'receiver',
	'store',
	'shipDistance',
	'paymentType',
	'totalPrice',
	'shippingFee',
	'createdAt',
	'quantity',
] as const) {}

export class CurrentOrderShortDTO extends OrderShortDTO {
	pickDistance?: number
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

export class ShipperInfoDTO extends PickType(Shipper, [
	'avatar',
	'name',
	'phone',
	'gender',
	'numberPlate',
] as const) {
	dob: number
	createdAt: number
}

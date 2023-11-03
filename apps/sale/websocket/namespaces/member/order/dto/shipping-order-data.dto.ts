import { OrderDetailDTO } from '@sale/src/shipper/dto/response.dto'

export type ShippingOrderDataDTO = Pick<
	OrderDetailDTO,
	| 'id'
	| 'receiver'
	| 'store'
	| 'paymentType'
	| 'totalPrice'
	| 'shippingFee'
	| 'createdAt'
> & {
	quantity: number
}

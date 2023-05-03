import { ShippingMethod } from '@/common/constants'

export class GetProductPriceApplyingVoucherDTO {
	fee: number
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

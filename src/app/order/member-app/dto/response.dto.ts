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

export class StatisticAmountItemModel {
	totalCount: number
	thisTime: number
	previousTime: number
}

export class StatisticAmountDTO {
	member: StatisticAmountItemModel
	order: StatisticAmountItemModel
	revenue: StatisticAmountItemModel
	sale: StatisticAmountItemModel
}

export class StatisticOrderDataItem {
	id: string
	inStoreCount: number
	pickupCount: number
	deliveryCount: number
	totalCount: number
	memberOrderCount: number
	totalProfit: number
	totalPickupOrderProfit: number
	totalDeliveryOrderProfit: number
}

export class StatisticOrderInPeriodDTO {
	year: StatisticOrderDataItem[]
	month: StatisticOrderDataItem[]
	day: StatisticOrderDataItem[]
}

export class SaleStatisticItemDTO {
	id: string
	name: string
	image: string
	saleVolume: number
	profit: number
}

export class StatisticRankAmountDTO {
	id: string
	name: string
	color: string
	minPoint: number
	members: ShortMemberData[]
}

export class ShortMemberData {
	id: string
	name: string
	point: number
}

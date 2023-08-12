export class StatisticAmountItemModel {
	totalCount: number
	thisTime: number
	previousTime: number
}

export class StatisticAmountModel {
	member: StatisticAmountItemModel
	order: StatisticAmountItemModel
	revenue: StatisticAmountItemModel
	sale: StatisticAmountItemModel
}

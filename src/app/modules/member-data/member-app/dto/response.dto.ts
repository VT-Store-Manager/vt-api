export class PointHistoryResultDTO {
	maxCount: number
	historyPoints: HistoryItemDTO[]
}

export class HistoryItemDTO {
	id: string
	point: number
	name: string
	targetId: string
	time: number
}

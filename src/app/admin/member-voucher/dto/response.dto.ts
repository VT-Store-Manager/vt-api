export class FailedRankItem {
	rank: string
	members: string[]
}

export class CreateResultItemDTO {
	voucher: string
	failedList: FailedRankItem[]
}

export class CreateMemberVoucherDTO {
	totalCount: number
	result: CreateResultItemDTO[]
}

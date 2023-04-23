export class CreateMemberVoucherDTO {
	totalCount: number
	successCount: number
	failedList: string[]
}

export class AvailableMemberVoucherDTO {
	id: string
	code: string
	name: string
	image: string
	partner?: string
	sliderImage: string
	from: number
	to: number
	description: string
}

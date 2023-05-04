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

export class UsedMemberVoucherDTO {
	id: string
	code: string
	name: string
	image: string
	partner?: string
	usedAt: number
	from: number
	to: number
	description: string
}

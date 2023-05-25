import { Status } from '@/common/constants'

export class GetVoucherListDTO {
	maxCount: number
	items: VoucherListItemDTO[]
}

export class VoucherListItemDTO {
	id: string
	name: string
	image: string
	code: string
	partner: ShortPartner
	startTime: number
	finishTime?: number
	updatedAt: number
	status: Status
}

export class ShortPartner {
	id: string
	name: string
	code: string
}

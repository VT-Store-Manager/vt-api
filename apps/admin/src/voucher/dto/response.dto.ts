import { Status } from '@app/common'

export class GetVoucherListDTO {
	totalCount: number
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
	deleted: boolean
	deletedAt?: Date
}

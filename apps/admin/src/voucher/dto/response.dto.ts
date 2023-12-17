import { Partner, Voucher } from '@app/database'
import { Status } from '@app/common'
import { PickType } from '@nestjs/swagger'

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

export class PartnerInVoucherDetailDTO extends PickType(Partner, [
	'code',
	'name',
	'image',
] as const) {
	id: string
}

export class VoucherDetailDTO extends PickType(Voucher, [
	'title',
	'image',
	'code',
	'description',
	'expireHour',
	'activeStartTime',
	'activeFinishTime',
	'discount',
	'condition',
	'slider',
	'disabled',
	'createdAt',
	'updatedAt',
] as const) {
	id: string
	partner: PartnerInVoucherDetailDTO
}

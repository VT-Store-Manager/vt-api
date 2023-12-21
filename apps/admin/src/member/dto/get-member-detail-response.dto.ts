import { MemberData, Rank } from '@app/database'
import { OmitType } from '@nestjs/swagger'
import { GetOrderDetailDTO } from '../../order/dto/response.dto'

export class MemberDetailResponseDTO {
	id: string
	name: string
	phone: string
	gender: number
	dob: Date
	deleted: boolean
	createdAt: Date
	promotionHistories: PromotionHistoryDTO[]
	memberData: MemberDataDTO
	memberRank: MemberRankDTO
	orders: MemberOrderDTO[]
	vouchers: MemberVoucherDTO[]
}

export class PromotionHistoryDTO {
	title: string
	description: string
	image: string
	cost: number
	voucher: {
		title: string
		code: string
		image: string
		id: string
	}
	createdAt: Date
}

export class MemberDataDTO {
	favoriteProducts: string[]
	favoriteStores: string[]
	address: MemberData['address']
	notifications: MemberData['notifications']
}

export class MemberRankDTO {
	code: string
	rank: {
		name: string
		appearance: Rank['appearance']
		id: string
	}
	usedPoint: number
	expiredPoint: number
	currentPoint: number
}

export class MemberOrderDTO extends OmitType(GetOrderDetailDTO, [
	'member',
] as const) {}

export class MemberVoucherDTO {
	id: string
	voucher: {
		id: string
		title: string
		image: string
		code: string
		disabled: boolean
	}
	startTime: Date
	finishTime: Date
	createdAt: Date
}

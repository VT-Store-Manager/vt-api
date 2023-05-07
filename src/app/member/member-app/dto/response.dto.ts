import {
	IntersectionType,
	OmitType,
	PartialType,
	PickType,
} from '@nestjs/swagger'

export class MemberProfileDTO {
	firstName: string
	lastName: string
	dob: number
	gender: number
	phone: string
}

export class CreateAddressResultDTO {
	id: string
}

export class GetMemberAddressDTO {
	defaultAddress: MemberDefaultAddressItemDTO[]
	otherAddress: MemberAddressItemDTO[]
}

export class MemberAddressItemDTO {
	id: string
	name: string
	icon: string
	address: string
	note?: string
	receiver: string
	phone: string
}

export class MemberDefaultAddressItemDTO extends IntersectionType(
	PickType(MemberAddressItemDTO, ['id', 'name', 'icon'] as const),
	PartialType(OmitType(MemberAddressItemDTO, ['id', 'name', 'icon'] as const))
) {}

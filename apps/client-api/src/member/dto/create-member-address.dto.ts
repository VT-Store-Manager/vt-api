import {
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsPhoneNumber,
	IsString,
} from 'class-validator'

import { MemberAddress } from '@app/database'
import { PickType } from '@nestjs/swagger'

export class CreateMemberAddressDTO extends PickType(MemberAddress, [
	'name',
	'address',
	'receiver',
	'phone',
	'note',
] as const) {
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	name?: string

	@IsString()
	@IsNotEmpty()
	address: string

	@IsString()
	@IsNotEmpty()
	receiver: string

	@IsPhoneNumber()
	@IsNotEmpty()
	phone: string

	@IsOptional()
	@IsNumber()
	lat?: number = 0

	@IsOptional()
	@IsNumber()
	lng?: number = 0

	@IsOptional()
	@IsString()
	note?: string = ''
}

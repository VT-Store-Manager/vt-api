import { Transform } from 'class-transformer'
import {
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	Matches,
} from 'class-validator'

import {
	validateAndTransformPhone,
	vnPhoneNumberPattern,
} from '@/libs/common/src'
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

	@IsString()
	@Matches(vnPhoneNumberPattern)
	@Transform(({ value }) => validateAndTransformPhone(value))
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

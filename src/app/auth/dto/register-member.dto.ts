import { Type } from 'class-transformer'
import {
	IsEnum,
	IsMobilePhone,
	IsNotEmpty,
	IsPositive,
	IsString,
	Matches,
} from 'class-validator'

import { Gender } from '@/common/constants'
import { Member } from '@/schemas/member.schema'
import { ApiProperty, PickType } from '@nestjs/swagger'

export class RegisterMemberDTO extends PickType(Member, [
	'mobile',
	'firstName',
	'lastName',
	'gender',
] as const) {
	@IsMobilePhone()
	@IsNotEmpty()
	@ApiProperty({ description: 'Phone number, unique' })
	mobile: string

	@IsString()
	@IsNotEmpty()
	@Matches(/^[a-zA-Z-]+$/)
	@ApiProperty({ description: 'Your first name' })
	firstName: string

	@IsString()
	@IsNotEmpty()
	@Matches(/^[a-zA-Z-]+$/)
	@ApiProperty({ description: 'Your last name' })
	lastName: string

	@IsEnum(Gender)
	@Type(() => Number)
	@ApiProperty({ description: '0 is male, 1 is female, 2 is other' })
	gender: Gender

	@Type(() => Number)
	@IsPositive()
	@ApiProperty({ description: 'Date of birth in UNIX time (milisecond)' })
	dob: number
}

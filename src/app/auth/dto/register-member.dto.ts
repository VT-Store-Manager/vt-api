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
import { PickType } from '@nestjs/swagger'

export class RegisterMemberDTO extends PickType(Member, [
	'mobile',
	'firstName',
	'lastName',
	'gender',
] as const) {
	@IsMobilePhone()
	@IsNotEmpty()
	mobile: string

	@IsString()
	@IsNotEmpty()
	@Matches(/^[a-zA-Z-]+$/)
	firstName: string

	@IsString()
	@IsNotEmpty()
	@Matches(/^[a-zA-Z-]+$/)
	lastName: string

	@IsEnum(Gender)
	@Type(() => Number)
	gender: Gender

	@Type(() => Number)
	@IsPositive()
	dob: number
}

import { Type } from 'class-transformer'
import {
	IsEnum,
	IsMobilePhone,
	IsNotEmpty,
	IsPositive,
	IsString,
	Matches,
} from 'class-validator'

import { Gender } from '@app/common'
import { Member } from '@app/database'
import { ApiProperty, PickType } from '@nestjs/swagger'

export class RegisterMemberDTO extends PickType(Member, [
	'phone',
	'firstName',
	'lastName',
	'gender',
] as const) {
	@IsMobilePhone()
	@IsNotEmpty()
	@ApiProperty({ description: 'Phone number, unique' })
	phone: string

	@IsString()
	@IsNotEmpty()
	@Matches(/^[0-9a-zA-Z-]+$/)
	@ApiProperty({ description: 'Your first name' })
	firstName: string

	@IsString()
	@IsNotEmpty()
	@Matches(/^[0-9a-zA-Z-]+$/)
	@ApiProperty({ description: 'Your last name' })
	lastName: string

	@IsEnum(Gender)
	@Type(() => Number)
	@ApiProperty({ description: '0 is male, 1 is female, 2 is other' })
	gender: Gender

	@Type(() => Number)
	@IsPositive()
	@ApiProperty({
		description: 'Date of birth in UNIX time (millisecond)',
	})
	dob: number = Date.now()
}

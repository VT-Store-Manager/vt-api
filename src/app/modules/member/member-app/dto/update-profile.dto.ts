import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

import { Member } from '@schema/member.schema'
import { PartialType, PickType } from '@nestjs/swagger'

export class UpdateProfileDTO extends PartialType(
	PickType(Member, ['firstName', 'lastName'] as const)
) {
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	firstName?: string

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	lastName?: string
}

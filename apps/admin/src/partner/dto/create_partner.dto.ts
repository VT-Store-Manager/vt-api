import { IsNotEmpty, IsString } from 'class-validator'

import { ApiPropertyFile } from '@app/common'
import { Partner } from '@app/database'
import { PickType } from '@nestjs/swagger'

export class CreatePartnerDTO extends PickType(Partner, [
	'code',
	'name',
] as const) {
	@ApiPropertyFile()
	image: any

	@IsString()
	@IsNotEmpty()
	code: string

	@IsString()
	@IsNotEmpty()
	name: string
}

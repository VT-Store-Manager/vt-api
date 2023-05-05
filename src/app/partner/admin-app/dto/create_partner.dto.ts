import { IsNotEmpty, IsString } from 'class-validator'

import { ApiPropertyFile } from '@/common/decorators/file-swagger.decorator'
import { Partner } from '@/schemas/partner.schema'
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

import { IsPhoneNumber } from 'class-validator'

import { ApiProperty } from '@nestjs/swagger'

export class LoginDTO {
	@IsPhoneNumber()
	@ApiProperty({ description: 'Phone number of account' })
	phone: string
}

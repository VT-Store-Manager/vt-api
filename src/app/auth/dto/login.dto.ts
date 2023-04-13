import { ApiProperty } from '@nestjs/swagger'
import { IsPhoneNumber } from 'class-validator'

export class LoginDTO {
	@IsPhoneNumber()
	@ApiProperty({ description: 'Phone number of account' })
	mobile: string
}

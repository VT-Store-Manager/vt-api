import { Role } from '@/common/constants'
import { ApiProperty } from '@nestjs/swagger'

export class TokenPayload {
	@ApiProperty({ description: "'member', 'admin', 'salesperson'" })
	role: Role[] | Role

	@ApiProperty({ description: 'User ID' })
	sub: string

	@ApiProperty({ description: 'Issued at' })
	iat?: number

	@ApiProperty({ description: 'Expire at' })
	exp?: number
}

export class UserPayload extends TokenPayload {}

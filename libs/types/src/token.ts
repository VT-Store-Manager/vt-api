import { Role } from '@app/common'
import { ApiProperty, OmitType } from '@nestjs/swagger'

export class TokenPayload {
	@ApiProperty({ description: "'member', 'admin', 'salesperson', 'shipper'" })
	role: Role[] | Role | string | string[]

	@ApiProperty({ description: 'User ID' })
	sub: string

	@ApiProperty({ description: 'Issued at' })
	iat?: number

	@ApiProperty({ description: 'Expire at' })
	exp?: number
}

export class UserPayload extends TokenPayload {}

export class AccountAdminPayload extends OmitType(TokenPayload, ['role']) {}

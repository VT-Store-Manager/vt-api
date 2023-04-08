import { Role } from '@/common/constants'

export class TokenPayload {
	role: Role[] | Role
	sub: string
	iat?: number
	exp?: number
}

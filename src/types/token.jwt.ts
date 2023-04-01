import { UserRole } from '@/common/constants'

export enum TokenSubject {
	ACCESS = 'access',
	REFRESH = 'refresh',
}

export class JwtTokenPayload {
	uid: string
	role: UserRole
	sub?: string
	iat?: number
	exp?: number
}

export class AccessTokenPayload extends JwtTokenPayload {
	firstName?: string
	lastName?: string
}

export class RefreshTokenPayload extends JwtTokenPayload {}

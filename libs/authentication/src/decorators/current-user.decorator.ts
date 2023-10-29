import { Request } from 'express'

import { TokenPayload, UserPayload } from '@app/types'
import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Socket } from 'socket.io'
import {
	AUTHENTICATED_USER_DATA,
	AUTHENTICATION_KEY,
} from '@sale/config/constant'

export const CurrentUser = createParamDecorator(
	(data: keyof UserPayload, context: ExecutionContext) => {
		const request = context.switchToHttp().getRequest<Request>()

		return data
			? (request['user'] as UserPayload)?.[data]
			: (request['user'] as UserPayload)
	}
)

export const CurrentClient = createParamDecorator(
	(authKey: keyof TokenPayload, context: ExecutionContext) => {
		const client = context.switchToWs().getClient<Socket>()

		const clientAuth: TokenPayload = client[AUTHENTICATION_KEY]

		if (authKey) return clientAuth[authKey]
		return clientAuth
	}
)

export const CurrentClientData = createParamDecorator(
	(key: string, context: ExecutionContext) => {
		const client = context.switchToWs().getClient<Socket>()

		const userData: TokenPayload = client[AUTHENTICATED_USER_DATA]

		if (key) return userData[key]
		return userData
	}
)

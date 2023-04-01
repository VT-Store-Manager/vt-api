import { Request } from 'express'

import { AccessTokenPayload } from '@/types/token.jwt'
import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const CurrentUser = createParamDecorator(
	(data: unknown, context: ExecutionContext) => {
		const request = context.switchToHttp().getRequest<Request>()
		return request['user'] as AccessTokenPayload
	}
)

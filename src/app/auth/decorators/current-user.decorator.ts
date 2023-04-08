import { Request } from 'express'

import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { TokenPayload } from '@/types/token.jwt'

export const CurrentUser = createParamDecorator(
	(data: unknown, context: ExecutionContext) => {
		const request = context.switchToHttp().getRequest<Request>()
		return request['user'] as TokenPayload
	}
)

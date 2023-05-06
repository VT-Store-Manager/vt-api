import { Request } from 'express'

import { UserPayload } from '@/types/token.dto'
import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const CurrentUser = createParamDecorator(
	(data: string, context: ExecutionContext) => {
		const request = context.switchToHttp().getRequest<Request>()

		return data
			? (request['user'] as UserPayload)?.[data]
			: (request['user'] as UserPayload)
	}
)

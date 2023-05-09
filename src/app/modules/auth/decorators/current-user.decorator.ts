import { Request } from 'express'

import { UserPayload } from '@/types/token'
import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const CurrentUser = createParamDecorator(
	(data: keyof UserPayload, context: ExecutionContext) => {
		const request = context.switchToHttp().getRequest<Request>()

		return data
			? (request['user'] as UserPayload)?.[data]
			: (request['user'] as UserPayload)
	}
)

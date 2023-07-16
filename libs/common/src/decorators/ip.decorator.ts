import { Request } from 'express'

import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const Ip = createParamDecorator(
	(data: unknown, ctx: ExecutionContext): string => {
		const request = ctx.switchToHttp().getRequest<Request>()
		return request.ip
	}
)

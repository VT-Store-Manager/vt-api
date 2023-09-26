import { Request } from 'express'

import { AccountAdminPayload } from '@app/types'
import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const CurrentAdmin = createParamDecorator(
	(data: keyof AccountAdminPayload, context: ExecutionContext) => {
		const request = context.switchToHttp().getRequest<Request>()

		return data
			? (request['user'] as AccountAdminPayload)?.[data]
			: (request['user'] as AccountAdminPayload)
	}
)

import {
	applyDecorators,
	createParamDecorator,
	ExecutionContext,
	UseGuards,
} from '@nestjs/common'

import { WsHttpServerGuard } from '../guards/ws-http-server.guard'
import { Socket } from 'socket.io'
import { IS_HTTP_SERVER_KEY } from '@sale/config/constant'

export function HttpServer() {
	return applyDecorators(UseGuards(WsHttpServerGuard))
}

export const IsHttpServer = createParamDecorator(
	(data: unknown, context: ExecutionContext) => {
		const client = context.switchToWs().getClient<Socket>()

		const isHttpServer = !!client[IS_HTTP_SERVER_KEY]

		return isHttpServer
	}
)

import { applyDecorators, UseGuards } from '@nestjs/common'

import { WsHttpServerGuard } from '../guards/ws-http-server.guard'

export function IsHttpServer() {
	return applyDecorators(UseGuards(WsHttpServerGuard))
}

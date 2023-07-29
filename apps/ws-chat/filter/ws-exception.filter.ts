import { ArgumentsHost, Catch, HttpException } from '@nestjs/common'
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets'
import { Socket } from 'socket.io'

@Catch()
export class WebsocketExceptionsFilter extends BaseWsExceptionFilter {
	catch(exception: WsException | HttpException, host: ArgumentsHost) {
		const client = host.switchToWs().getClient() as Socket
		const data = host.switchToWs().getData()
		const error =
			exception instanceof WsException
				? exception.getError()
				: exception.getResponse()
		const details = error instanceof Object ? { ...error } : { message: error }
		client.emit(
			JSON.stringify({
				event: 'error',
				data: {
					id: (client as any).id,
					rid: data.rid,
					...details,
				},
			})
		)
	}
}

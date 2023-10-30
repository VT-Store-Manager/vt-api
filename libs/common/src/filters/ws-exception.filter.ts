import { ArgumentsHost, Catch, HttpException } from '@nestjs/common'
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets'
import { Socket } from 'socket.io'

type WsExceptionResponse = {
	error: string
	message?: string
}

const COMMON_WS_EXCEPTION_NAME = 'Bad Event'
const VALIDATION_ERROR_NAME = 'Validation Error'
const INTERNAL_SERVER_ERROR_NAME = 'Internal Server Error'

const getExceptionData = (
	exception: Error | HttpException | WsException,
	client: Socket
): WsExceptionResponse | undefined => {
	const isWsException = exception instanceof WsException
	const isHttpException = exception instanceof HttpException

	const error: Error | string = (
		isWsException
			? exception.getError()
			: isHttpException
			? exception.getResponse()
			: exception.message
	) as any

	if (typeof error === 'string') {
		return {
			error: COMMON_WS_EXCEPTION_NAME,
			message: error,
		}
	}
	if (error.message && Array.isArray(error.message)) {
		return {
			error: VALIDATION_ERROR_NAME,
			message: (error.message as string[])
				.map(v => v?.toString() || '' + v)
				.join('\n'),
		}
	}
	if (isHttpException) {
		const status = exception.getStatus()
		if (status >= 500) {
			return {
				error: INTERNAL_SERVER_ERROR_NAME,
				message: error.message,
			}
		} else if (status === 401) {
			client.rooms.clear()
			client.emit('unauthorized')
			return
		}
	}

	return {
		error: error.name || COMMON_WS_EXCEPTION_NAME,
		message: error.message,
	}
}

@Catch()
export class WebsocketExceptionsFilter extends BaseWsExceptionFilter {
	catch(exception: WsException | HttpException, host: ArgumentsHost) {
		const client = host.switchToWs().getClient<Socket>()

		const exceptionData = getExceptionData(exception, client)

		if (exceptionData) {
			client.emit('error', {
				...exceptionData,
			})
		}
	}
}

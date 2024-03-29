import { capitalize } from 'lodash'
import { Socket } from 'socket.io'

import { AllEventMap } from '@app/types'
import { ArgumentsHost, Catch, HttpException, Logger } from '@nestjs/common'
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets'
import {
	AUTHENTICATED_USER_DATA,
	AUTHENTICATION_KEY,
	IS_HTTP_SERVER_KEY,
} from '@sale/config/constant'
import { SocketIoLogger } from '../helpers'

const COMMON_WS_EXCEPTION_NAME = 'Bad Event'
const VALIDATION_ERROR_NAME = 'Validation Error'
const INTERNAL_SERVER_ERROR_NAME = 'Internal Server Error'

const getExceptionData = (
	exception: Error | HttpException | WsException,
	client: Socket<AllEventMap>
): Error | undefined => {
	SocketIoLogger.error(exception)
	const isWsException = exception instanceof WsException
	const isHttpException = exception instanceof HttpException
	const userData = client[AUTHENTICATED_USER_DATA]

	const error: Error | string = (
		isWsException
			? exception.getError()
			: isHttpException
			? exception.getResponse()
			: exception.message
	) as any

	if (typeof error === 'string') {
		return {
			name: COMMON_WS_EXCEPTION_NAME,
			message: error,
		}
	}
	if (error.message && Array.isArray(error.message)) {
		return {
			name: VALIDATION_ERROR_NAME,
			message: (error.message as string[])
				.map(v => v?.toString() || '' + v)
				.join('\n'),
		}
	}
	if (isHttpException) {
		const status = exception.getStatus()
		if (status >= 500) {
			return {
				name: INTERNAL_SERVER_ERROR_NAME,
				message: error.message,
			}
		} else if (status === 401) {
			if (!userData) {
				SocketIoLogger.debug(`[${client.id}] unauthenticated`)
			} else {
				SocketIoLogger.debug(
					`[${client.id}] unauthenticated: ${capitalize(userData.role)} - ${
						userData.name
					} - UID ${userData.id}`
				)
			}
			delete client[AUTHENTICATION_KEY]
			delete client[AUTHENTICATED_USER_DATA]
			delete client[IS_HTTP_SERVER_KEY]
			client.rooms.clear()
			client.emit('unauthorized')
			return
		}
	}

	return {
		name: error.name || COMMON_WS_EXCEPTION_NAME,
		message: error.message,
	}
}

@Catch()
export class WebsocketExceptionsFilter extends BaseWsExceptionFilter {
	catch(exception: WsException | HttpException, host: ArgumentsHost) {
		Logger.error(exception.name, exception.stack)
		const client = host.switchToWs().getClient<Socket>()

		const exceptionData = getExceptionData(exception, client)

		if (exceptionData) {
			client.emit('error', exceptionData)
		}
	}
}

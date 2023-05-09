import { Response } from 'express'

import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
} from '@nestjs/common'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const response = host.switchToHttp().getResponse<Response>()
		const statusCode =
			exception['response'].statusCode || HttpStatus.BAD_REQUEST
		if (exception['response']) {
			response.status(statusCode).json({
				statusCode: statusCode,
				error: exception['response'].error,
				message: Array.isArray(exception['response'].message)
					? exception['response'].message.join('\n')
					: exception['response'].message,
			})
		} else {
			response.status(exception.getStatus()).json({
				statusCode: response.statusCode,
				error: exception.name,
				message: Array.isArray(exception.message)
					? exception.message.join('\n')
					: exception.message,
			})
		}
	}
}

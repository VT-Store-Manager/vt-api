import { Response } from 'express'

import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
} from '@nestjs/common'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const response = host.switchToHttp().getResponse<Response>()

		if (exception['response']) {
			response.status(exception['response'].statusCode).json({
				statusCode: exception['response'].statusCode,
				error: exception['response'].error,
				message: exception['response'].message,
			})
		} else {
			response.status(exception.getStatus()).json({
				statusCode: response.statusCode,
				error: exception.name,
				message: exception.message,
			})
		}
	}
}

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
		const context = host.switchToHttp()
		const response = context.getResponse<Response>()

		response.status(exception.getStatus()).json({
			timestamp: new Date().toISOString(),
			message: exception.message,
		})
	}
}

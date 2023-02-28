import { Response } from 'express'
import { Error } from 'mongoose'

import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpStatus,
} from '@nestjs/common'

import { MongoException } from '../exceptions/mongo.exception'

@Catch(MongoException, Error.ValidationError)
export class MongoExceptionFilter implements ExceptionFilter {
	catch(exception: MongoException, host: ArgumentsHost) {
		const context = host.switchToHttp()
		const response = context.getResponse<Response>()
		const status = exception.httpCode ?? HttpStatus.BAD_REQUEST

		response.status(status).json({
			timestamp: new Date().toISOString(),
			message: exception.message,
		})
	}
}

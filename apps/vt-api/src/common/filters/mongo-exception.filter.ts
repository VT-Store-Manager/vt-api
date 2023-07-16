import { Response } from 'express'
import { MongoError, MongoServerError } from 'mongodb'
import { Error } from 'mongoose'

import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpStatus,
} from '@nestjs/common'

@Catch(MongoError, Error.ValidationError)
export class MongoExceptionFilter implements ExceptionFilter {
	catch(exception: MongoError, host: ArgumentsHost) {
		const context = host.switchToHttp()
		const response = context.getResponse<Response>()
		const status = exception['httpCode'] ?? HttpStatus.INTERNAL_SERVER_ERROR

		if (this.isDuplicateKeyError(exception)) {
			const mongoServerErr = exception as MongoServerError
			const key = Object.keys(mongoServerErr.keyValue)[0]
			exception.message = `Value ${JSON.stringify(
				mongoServerErr.keyValue[key]
			)} of field '${key}' is duplicated`
		}

		const responseData = {
			statusCode: status,
			error: exception.name,
			message: exception.message,
		}
		response['_data'] = responseData
		response.status(status).json(responseData)
	}

	private isDuplicateKeyError(err: MongoError) {
		return err.name === 'MongoServerError' && err.code === 11000
	}
}

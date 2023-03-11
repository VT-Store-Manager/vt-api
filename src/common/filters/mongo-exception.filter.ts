import { Response } from 'express'
import { Error } from 'mongoose'

import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpStatus,
} from '@nestjs/common'

import { MongoError, MongoServerError } from 'mongodb'

@Catch(MongoError, Error.ValidationError)
export class MongoExceptionFilter implements ExceptionFilter {
	catch(exception: MongoError, host: ArgumentsHost) {
		const context = host.switchToHttp()
		const response = context.getResponse<Response>()
		const status = exception['httpCode'] ?? HttpStatus.BAD_REQUEST

		if (this.isDuplicateKeyError(exception)) {
			const mongoServerErr = exception as MongoServerError
			const key = Object.keys(mongoServerErr.keyValue)[0]
			exception.message = `Value ${JSON.stringify(
				mongoServerErr.keyValue[key]
			)} of field '${key}' is duplicated`
		}

		response.status(status).json({
			name: exception.name,
			message: exception.message,
		})
	}

	private isDuplicateKeyError(err: MongoError) {
		return err.name === 'MongoServerError' && err.code === 11000
	}
}

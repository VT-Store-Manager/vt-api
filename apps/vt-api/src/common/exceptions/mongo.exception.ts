import { MongoError } from 'mongodb'

import { HttpStatus } from '@nestjs/common'

export class MongoException extends MongoError {
	exceptionName: string
	httpCode: number
	constructor(
		message: string,
		httpCode = HttpStatus.BAD_REQUEST,
		exceptionName = MongoError.name
	) {
		super(message)
		this.httpCode = httpCode
		this.exceptionName = exceptionName
	}
}

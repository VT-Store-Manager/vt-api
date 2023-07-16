import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpStatus,
} from '@nestjs/common'
import { ValidationError } from 'class-validator'
import { Response } from 'express'

@Catch(ValidationError)
export class ClassValidatorExceptionFilter implements ExceptionFilter {
	catch(exception: ValidationError | ValidationError[], host: ArgumentsHost) {
		const context = host.switchToHttp()
		const response = context.getResponse<Response>()

		if (!Array.isArray(exception)) {
			exception = [exception]
		}

		const responseData = {
			statusCode: response.statusCode,
			error: `Validation error${exception.length > 1 ? 's' : ''}`,
			message: exception
				.reduce((res, cur) => {
					const constraints = Object.values(cur.constraints).map(
						constraintValue =>
							constraintValue
								.replace('$property', cur.property)
								.replace('$value', cur.value)
					)
					return [...res, ...constraints]
				}, [])
				.join('\n'),
		}
		response['_data'] = responseData
		response.status(HttpStatus.BAD_REQUEST).json(responseData)
	}
}

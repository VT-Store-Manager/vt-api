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

		response.status(HttpStatus.BAD_REQUEST).json({
			message: `Validation error${exception.length > 1 ? 's' : ''}`,
			errors: exception.reduce((pre, cur) => {
				return {
					...pre,
					[cur.property]: {
						value: cur.value,
						constraints: Object.values(cur.constraints),
					},
				}
			}, {}),
		})
	}
}

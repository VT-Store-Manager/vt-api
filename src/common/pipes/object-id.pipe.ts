import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common'
import { ValidationError } from 'class-validator'
import * as Joi from 'joi'

@Injectable()
export class ObjectIdPipe implements PipeTransform {
	transform(value: string, metadata: ArgumentMetadata) {
		const { error } = Joi.string()
			.pattern(new RegExp(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i))
			.validate(value)

		if (error) {
			const validateErr = new ValidationError()

			validateErr.property = metadata.data
			validateErr.value = value
			validateErr.constraints = {
				pattern: 'Value is not matched with object id pattern',
			}

			throw validateErr
		}
		return value
	}
}

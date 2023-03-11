import { ValidationError } from 'class-validator'
import * as Joi from 'joi'

import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common'

@Injectable()
export class S3KeyPipe implements PipeTransform {
	transform(value: string, metadata: ArgumentMetadata) {
		const { error } = Joi.string()
			.pattern(new RegExp("^[a-zA-Z0-9!_.*'()-]+(/[a-zA-Z0-9!_.*'()-]+)*$"))
			.validate(value)
		if (error) {
			const validateErr = new ValidationError()

			validateErr.property = metadata.data
			validateErr.value = value
			validateErr.constraints = {
				pattern: 'Value is not matched with key pattern',
			}

			throw validateErr
		}
		return value
	}
}

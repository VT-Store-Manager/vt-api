import { ValidationError } from 'class-validator'

import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common'

import Joi from '../validations/joi.validator'

@Injectable()
export class EnumPipe implements PipeTransform {
	private values: Array<string | number>
	constructor(record: Record<string, string | number>) {
		this.values = Object.values(record)
	}

	transform(value: string | number, metadata: ArgumentMetadata) {
		const error = Joi.string()
			.valid(...this.values)
			.validate(value).error
		if (error) {
			const validateErr = new ValidationError()

			validateErr.property = metadata.data
			validateErr.value = value
			validateErr.constraints = {
				in: `$property is not in valid list: ${this.values.join(', ')}`,
			}

			throw validateErr
		}
		return value
	}
}
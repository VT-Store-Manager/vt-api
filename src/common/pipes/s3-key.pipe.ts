import { ValidationError } from 'class-validator'
import * as Joi from 'joi'

import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common'

@Injectable()
export class S3KeyValidationPipe implements PipeTransform {
	transform(value: string, _metadata: ArgumentMetadata) {
		const { error } = Joi.string()
			.pattern(new RegExp("^[a-zA-Z0-9!_.*'()-]+(/[a-zA-Z0-9!_.*'()-]+)*$"))
			.validate(value)
		if (!error) throw new ValidationError()
		return value
	}
}

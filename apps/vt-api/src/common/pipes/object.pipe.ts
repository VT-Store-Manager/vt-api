import { capitalize } from 'lodash'

import {
	ArgumentMetadata,
	BadRequestException,
	Injectable,
	PipeTransform,
} from '@nestjs/common'

import { clearUndefineOrNullField } from '../helpers/body.helper'

@Injectable()
export class NotEmptyObjectPipe implements PipeTransform {
	transform(value: Record<string, any>, metadata: ArgumentMetadata) {
		if (
			Object.values(value).filter(v => v !== undefined && v !== null).length
		) {
			return value
		}
		throw new BadRequestException(
			`${capitalize(metadata.type)} must not be empty`
		)
	}
}

@Injectable()
export class RemoveNullishObjectPipe implements PipeTransform {
	transform(value: Record<string | number, any>) {
		clearUndefineOrNullField(value)
		return value
	}
}

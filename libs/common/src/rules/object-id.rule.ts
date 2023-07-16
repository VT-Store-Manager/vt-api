import {
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator'

import { Injectable } from '@nestjs/common'
import { isObjectIdOrHexString } from 'mongoose'

@ValidatorConstraint({ name: 'ObjectIdRule' })
@Injectable()
export class ObjectIdRule implements ValidatorConstraintInterface {
	validate(value: string): boolean {
		return isObjectIdOrHexString(value)
	}
	defaultMessage?(): string {
		return '$property: $value must be an ObjectId string (24 characters hex)'
	}
}

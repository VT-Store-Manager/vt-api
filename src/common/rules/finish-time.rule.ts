import {
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator'

import { Injectable } from '@nestjs/common'

@ValidatorConstraint({ name: 'FinishTimeRule' })
@Injectable()
export class FinishTimeRule implements ValidatorConstraintInterface {
	validate(value: number, { object }: ValidationArguments): boolean {
		if (value < new Date(2000, 0, 1).getTime()) return false
		return value > object['activeStartTime']
	}

	defaultMessage(): string {
		return 'Finish time must be greater than UNIX time of 2000/01/01 and greater than start time value'
	}
}

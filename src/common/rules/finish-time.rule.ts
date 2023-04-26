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
		if (value < new Date(2023, 0, 1).getTime()) return false
		const startTime: number =
			object['activeStartTime'] ?? object['startTime'] ?? Date.now()
		return value > startTime
	}

	defaultMessage(): string {
		return 'Finish time must be greater than UNIX time of 2023/01/01 and greater than start time value'
	}
}

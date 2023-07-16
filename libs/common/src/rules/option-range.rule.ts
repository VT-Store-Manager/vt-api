import {
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator'

import { Injectable } from '@nestjs/common'

@ValidatorConstraint({ name: 'ProductOptionRangeRule' })
@Injectable()
export class OptionRangeRule implements ValidatorConstraintInterface {
	validate(value: number[]): boolean {
		return value[0] <= value[1]
	}
	defaultMessage?(): string {
		return 'min value of range cannot greater then max value of range'
	}
}

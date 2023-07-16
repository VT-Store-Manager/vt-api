import {
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator'

import { Injectable } from '@nestjs/common'

@ValidatorConstraint({ name: 'StoreOpenTimeRule' })
@Injectable()
export class StoreOpenTimeRule implements ValidatorConstraintInterface {
	validate(value: string): boolean {
		const pattern = new RegExp(/^(([0-1][0-9])|(2[0-3])):[0-5][0-9]$/)
		return pattern.test(value)
	}
	defaultMessage(): string {
		return '$property: $value must be formatted hh:mm'
	}
}

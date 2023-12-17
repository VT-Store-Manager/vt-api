import { Transform } from 'class-transformer'
import { IsString, Matches } from 'class-validator'

import { validateAndTransformPhone, vnPhoneNumberPattern } from '@app/common'

export class LoginShipperDTO {
	@IsString()
	@Matches(vnPhoneNumberPattern)
	@Transform(({ value }) => validateAndTransformPhone(value))
	phone: string
}

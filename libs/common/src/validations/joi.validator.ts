import * as CoreJoi from 'joi'
import JoiPhoneNumberFactory from 'joi-phone-number'

import JoiDateFactory from '@joi/date'

export const Joi = (
	CoreJoi.extend(JoiPhoneNumberFactory) as typeof CoreJoi
).extend(JoiDateFactory) as typeof CoreJoi

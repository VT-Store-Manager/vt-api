import * as CoreJoi from 'joi'
import JoiPhoneNumberFactory from 'joi-phone-number'

import JoiDateFactory from '@joi/date'

const Joi = (CoreJoi.extend(JoiPhoneNumberFactory) as typeof CoreJoi).extend(
	JoiDateFactory
) as typeof CoreJoi

export default Joi

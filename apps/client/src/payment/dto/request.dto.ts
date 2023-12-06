import { MomoCheckTransactionStatusModel, MomoCreatePayment } from '@app/common'
import { PartialType, PickType } from '@nestjs/swagger'

export class CreateMomoPaymentDTO extends PickType(MomoCreatePayment, [
	'redirectUrl',
	'lang',
] as const) {
	lang = 'en' as const
}

export class CheckTransactionStatusDTO extends PartialType(
	PickType(MomoCheckTransactionStatusModel, ['lang'] as const)
) {
	lang = 'en' as const
}

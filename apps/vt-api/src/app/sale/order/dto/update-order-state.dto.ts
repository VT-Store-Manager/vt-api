import { IsEnum, IsMongoId } from 'class-validator'

import { OrderState } from '@app/common'

export class UpdateOrderStateDTO {
	@IsMongoId()
	id: string

	@IsEnum(OrderState)
	status: OrderState
}

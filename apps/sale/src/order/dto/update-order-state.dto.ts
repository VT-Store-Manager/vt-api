import { IsEnum, IsMongoId, IsOptional } from 'class-validator'

import { OrderState } from '@app/common'

export class UpdateOrderStateDTO {
	@IsMongoId()
	id: string

	@IsEnum(OrderState)
	status: OrderState

	@IsOptional()
	@IsMongoId()
	employeeId?: string
}

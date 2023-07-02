import { OrderState } from '@/common/constants'
import { IsEnum, IsMongoId } from 'class-validator'

export class UpdateOrderStateDTO {
	@IsMongoId()
	id: string

	@IsEnum(OrderState)
	status: OrderState
}

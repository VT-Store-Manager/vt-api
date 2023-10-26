import { ShipperOrderState } from '@app/common'
import { IsEnum } from 'class-validator'

export class UpdateShipperOrderStateDTO {
	@IsEnum(ShipperOrderState)
	status: ShipperOrderState
}

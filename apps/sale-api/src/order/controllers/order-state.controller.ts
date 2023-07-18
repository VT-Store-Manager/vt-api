import { CurrentUser, JwtAccess } from '@app/authentication'
import { ApiSuccessResponse, EnumPipe, OrderState, Role } from '@app/common'
import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { GetOrderByStateDTO } from '../dto/get-order-by-state.dto'
import { OrderByStateResultDTO, OrderStateItemDTO } from '../dto/response.dto'
import { OrderStateService } from '../services/order-state.service'

@Controller({
	path: 'sale/cart-status',
	version: '1',
})
@ApiTags('sale-app > order-state')
export class OrderStateController {
	constructor(private readonly orderStateService: OrderStateService) {}

	@Get(':state')
	@JwtAccess(Role.SALESPERSON)
	@ApiSuccessResponse(OrderByStateResultDTO)
	async getOrdersByState(
		@CurrentUser('sub') stareId: string,
		@Param('state', new EnumPipe(OrderState, { _: 'all' }))
		state: OrderState | 'all',
		@Query() query: GetOrderByStateDTO
	) {
		return await this.orderStateService.getOrderByState(stareId, state, query)
	}

	@Get()
	@ApiSuccessResponse(OrderStateItemDTO, 200, true)
	getAllOrderState() {
		return this.orderStateService.getAllOrderStates()
	}
}

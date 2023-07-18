import { CurrentUser, JwtAccess } from '@app/authentication'
import { ApiSuccessResponse, EnumPipe, OrderState, Role } from '@app/common'
import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { GetOrderByStateDTO } from '../dto/get-order-by-state.dto'
import { OrderByStateResultDTO, OrderStateItemDTO } from '../dto/response.dto'
import { OrderStateService } from '../services/order-state.service'

@Controller({
	path: 'cart-status',
	version: '1',
})
@ApiTags('member-app > order-state')
export class OrderStateController {
	constructor(private readonly orderStateService: OrderStateService) {}

	@Get('all')
	@ApiSuccessResponse(OrderStateItemDTO, 200, true)
	getAllOrderState() {
		return this.orderStateService.getAllOrderStates()
	}

	@Get(':state')
	@JwtAccess(Role.MEMBER)
	@ApiSuccessResponse(OrderByStateResultDTO)
	async getOrdersByState(
		@CurrentUser('sub') memberId: string,
		@Param('state', new EnumPipe(OrderState)) state: OrderState,
		@Query() query: GetOrderByStateDTO
	) {
		return await this.orderStateService.getOrderByState(memberId, state, query)
	}
}

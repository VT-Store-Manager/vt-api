import { CurrentUser } from '@/app/authentication/decorators/current-user.decorator'
import { JwtAccess } from '@/app/authentication/decorators/jwt.decorator'
import { OrderState, Role } from '@/common/constants'
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { EnumPipe } from '@/common/pipes/enum.pipe'
import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { GetOrderByStateDTO } from '../dto/get-order-by-state.dto'
import { OrderByStateResultDTO, OrderStateItemDTO } from '../dto/response.dto'
import { OrderStateMemberService } from '../services/order-state_member.service'

@Controller({
	path: 'cart-status',
	version: '1',
})
@ApiTags('member-app > order-state')
export class OrderStateMemberController {
	constructor(private readonly orderStateService: OrderStateMemberService) {}

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

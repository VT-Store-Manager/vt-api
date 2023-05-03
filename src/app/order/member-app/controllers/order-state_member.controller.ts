import { CurrentUser } from '@/app/auth/decorators/current-user.decorator'
import { JwtAccess } from '@/app/auth/decorators/jwt.decorator'
import { OrderState, Role } from '@/common/constants'
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { EnumPipe } from '@/common/pipes/enum.pipe'
import { UserPayload } from '@/types/token.dto'
import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { GetOrderByStateDTO } from '../dto/get-order-by-state.dto'
import { OrderByStateResultDTO } from '../dto/response.dto'
import { OrderStateMemberService } from '../services/order-state_member.service'

@Controller({
	path: 'cart-status',
	version: '1',
})
@ApiTags('member-app > order-state')
export class OrderStateMemberController {
	constructor(private readonly orderStateService: OrderStateMemberService) {}

	@Get(':state')
	@JwtAccess(Role.MEMBER)
	@ApiSuccessResponse(OrderByStateResultDTO)
	async getOrdersByState(
		@CurrentUser() user: UserPayload,
		@Param('state', new EnumPipe(OrderState)) state: OrderState,
		@Query() query: GetOrderByStateDTO
	) {
		return await this.orderStateService.getOrderByState(user.sub, state, query)
	}
}

import { BooleanResponseDTO } from '@/libs/types/src'
import { CurrentUser, JwtAccess } from '@app/authentication'
import { ApiSuccessResponse, ObjectIdPipe, Role } from '@app/common'
import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'

import { GetOrderListDTO } from '../dto/get-order-list.dto'
import { OrderListPaginationResultDTO } from '../dto/response.dto'
import { UpdateShipperOrderStateDTO } from '../dto/update-shipper-order-state.dto'
import { ShipperOrderService } from '../services/order.service'

@Controller('shipper/order')
@ApiTags('shipper-app > order')
export class ShipperOrderController {
	constructor(private readonly orderService: ShipperOrderService) {}

	@Patch(':orderId')
	@JwtAccess(Role.SHIPPER)
	@ApiResponse({ type: BooleanResponseDTO, status: 200 })
	async updateShipperOrderState(
		@CurrentUser('sub') shipperId: string,
		@Param('orderId', ObjectIdPipe) orderId: string,
		@Body() body: UpdateShipperOrderStateDTO
	) {
		return await this.orderService.updateOrderStatus(
			shipperId,
			orderId,
			body.status
		)
	}

	@Get('list')
	@JwtAccess(Role.SHIPPER)
	@ApiSuccessResponse(OrderListPaginationResultDTO)
	async getOrderList(
		@CurrentUser('sub') shipperId: string,
		@Query() query: GetOrderListDTO
	): Promise<OrderListPaginationResultDTO> {
		if (query.page < 1) query.page = 1
		if (query.limit < 1) query.limit = 20
		return await this.orderService.getOrderListPagination(shipperId, query)
	}
}

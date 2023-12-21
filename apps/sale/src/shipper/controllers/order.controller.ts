import { BooleanResponseDTO } from '@/libs/types/src'
import { CurrentUser, JwtAccess } from '@app/authentication'
import { ApiSuccessResponse, ObjectIdPipe, Role } from '@app/common'
import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'

import { GetOrderListDTO } from '../dto/get-order-list.dto'
import {
	CurrentOrderShortDTO,
	OrderDetailDTO,
	OrderListPaginationResultDTO,
} from '../dto/response.dto'
import { UpdateShipperOrderStateDTO } from '../dto/update-shipper-order-state.dto'
import { ShipperOrderService } from '../services/order.service'
import { GetPendingOrderListDTO } from '../dto/get-pending-order-list.dto'

@Controller('shipper/order')
@ApiTags('shipper-app > order')
export class ShipperOrderController {
	constructor(private readonly orderService: ShipperOrderService) {}

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

	@Get('delivering')
	@JwtAccess(Role.SHIPPER)
	@ApiSuccessResponse(CurrentOrderShortDTO, 200, true)
	async getDeliveringOrderList(
		@CurrentUser('sub') shipperId: string,
		@Query() query: GetPendingOrderListDTO
	) {
		return await this.orderService.getDeliveringOrder(shipperId, query)
	}

	@Get('current')
	@JwtAccess(Role.SHIPPER)
	@ApiSuccessResponse(CurrentOrderShortDTO, 200, true)
	async getPendingOrderShortList(
		@Query() query: GetPendingOrderListDTO
	): Promise<CurrentOrderShortDTO[]> {
		return await this.orderService.getPendingList(query)
	}

	@Get(':orderId/detail')
	@JwtAccess(Role.SHIPPER)
	@ApiSuccessResponse(OrderDetailDTO)
	async getShipperOrderDetail(
		@CurrentUser('sub') shipperId: string,
		@Param('orderId', ObjectIdPipe) orderId: string
	) {
		return await this.orderService.getOrderDetail(orderId, shipperId)
	}

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
}

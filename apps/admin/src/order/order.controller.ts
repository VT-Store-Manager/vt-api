import { ApiSuccessResponse, NotEmptyObjectPipe } from '@app/common'
import { PaginationModel } from '@app/types'
import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { GetOrderDetailQueryDTO } from './dto/get-order-detail-query.dto'
import { GetOrderHistoryPaginationDTO } from './dto/get-order-history.dto'
import { GetOrderDetailDTO, OrderDetailDTO } from './dto/response.dto'
import { OrderService } from './order.service'

@Controller('admin/order')
@ApiTags('admin-app > order')
export class OrderController {
	constructor(private readonly orderService: OrderService) {}

	@Get('history')
	@ApiSuccessResponse(PaginationModel<GetOrderDetailDTO>)
	async getOrderHistoryPagination(
		@Query() query: GetOrderHistoryPaginationDTO
	) {
		return await this.orderService.getHistoryPagination(query)
	}

	@Get('detail')
	@ApiSuccessResponse(OrderDetailDTO)
	async getOrderDetail(
		@Query(NotEmptyObjectPipe) query: GetOrderDetailQueryDTO
	) {
		return await this.orderService.getOrderDetail(query.id || query.code)
	}
}

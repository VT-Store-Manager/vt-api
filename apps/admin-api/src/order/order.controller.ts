import { ApiSuccessResponse } from '@app/common'
import { PaginationModel } from '@app/types'
import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { GetOrderHistoryPaginationDTO } from './dto/get-order-history.dto'
import { GetOrderDetailDTO } from './dto/response.dto'
import { OrderService } from './order.service'

@Controller({
	path: 'admin/order',
	version: '1',
})
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
}

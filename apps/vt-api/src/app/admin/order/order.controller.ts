import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { OrderService } from './order.service'
import { GetOrderHistoryPaginationDTO } from './dto/get-order-history.dto'
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { PaginationModel } from '@/types'
import { GetOrderDetailDTO } from './dto/response.dto'

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

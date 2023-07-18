import { CurrentUser, JwtAccess } from '@app/authentication'
import { ApiSuccessResponse, Role } from '@app/common'
import { MongoSessionService, Order } from '@app/database'
import { BooleanResponseDTO } from '@app/types'
import {
	Body,
	Controller,
	InternalServerErrorException,
	Patch,
	Post,
} from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'

import { CreateOrderDTO } from '../dto/create-order.dto'
import { CreateOrderResponseDTO } from '../dto/response.dto'
import { UpdateOrderStateDTO } from '../dto/update-order-state.dto'
import { OrderService } from '../services/order.service'

@Controller({
	path: 'sale/cart',
	version: '1',
})
@ApiTags('sale-app > cart')
export class OrderController {
	constructor(
		private readonly orderService: OrderService,
		private readonly mongoSessionService: MongoSessionService
	) {}

	@Post('create')
	@JwtAccess(Role.SALESPERSON)
	@ApiSuccessResponse(CreateOrderResponseDTO, 201)
	async createOrder(
		@CurrentUser('sub') storeId: string,
		@Body() body: CreateOrderDTO
	) {
		let order: Order
		const { error } = await this.mongoSessionService.execTransaction(
			async session => {
				order = await this.orderService.create(storeId, body, session)
			}
		)
		if (error) {
			throw new InternalServerErrorException(error.message)
		}
		return order
	}

	@Patch('status')
	@JwtAccess(Role.SALESPERSON)
	@ApiResponse({ type: BooleanResponseDTO, status: 201 })
	async updateOrderStatus(@Body() body: UpdateOrderStateDTO) {
		return await this.orderService.updateState(body)
	}
}

import { CurrentUser } from '@/app/authentication/decorators/current-user.decorator'
import { JwtAccess } from '@/app/authentication/decorators/jwt.decorator'
import { Role } from '@/common/constants'
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { MongoSessionService } from '@/common/providers/mongo-session.service'
import { Order } from '@/database/schemas/order.schema'
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
import { OrderService } from '../services/order.service'
import { BooleanResponseDTO } from '@/types/swagger'
import { UpdateOrderStateDTO } from '../dto/update-order-state.dto'

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

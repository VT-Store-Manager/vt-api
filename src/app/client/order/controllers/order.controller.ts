import { CurrentUser } from '@/app/authentication/decorators/current-user.decorator'
import { JwtAccess } from '@/app/authentication/decorators/jwt.decorator'
import { Role } from '@/common/constants'
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { ObjectIdPipe } from '@/common/pipes/object-id.pipe'
import { BooleanResponseDTO } from '@/types/swagger'
import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'

import { CheckVoucherDTO } from '../dto/check-voucher.dto'
import { CreateOrderDTO } from '../dto/create-order.dto'
import {
	GetOrderDetailDTO,
	GetProductPriceApplyingVoucherDTO,
} from '../dto/response.dto'
import { ReviewOrderDTO } from '../dto/review-order.dto'
import { OrderService } from '../services/order.service'

@Controller({
	path: 'member/cart',
	version: '1',
})
@ApiTags('member-app > order')
export class OrderController {
	constructor(private readonly orderService: OrderService) {}

	@Post('check-voucher')
	@JwtAccess(Role.MEMBER)
	async checkVoucherForApply(
		@CurrentUser('sub') memberId: string,
		@Body() body: CheckVoucherDTO
	): Promise<GetProductPriceApplyingVoucherDTO> {
		const applyVoucherResult = await this.orderService.validateVoucher(
			memberId,
			body
		)
		// For reuse
		const fee =
			applyVoucherResult.deliveryPrice - applyVoucherResult.deliverySalePrice
		return {
			fee,
			originalFee: applyVoucherResult.deliveryPrice,
			cost:
				applyVoucherResult.products.reduce((res, product) => {
					const productPrice =
						product.quantity * (product.mainPrice + product.extraPrice) -
						product.discountPrice
					return res + productPrice
				}, 0) + fee,
			voucherDiscount:
				applyVoucherResult.totalDiscount ||
				applyVoucherResult.products.reduce((res, product) => {
					return res + product.discountPrice
				}, 0),
			products: applyVoucherResult.products.map(product => ({
				id: product.id,
				cost: (product.mainPrice + product.extraPrice) * product.quantity,
				discount: product.discountPrice,
			})),
		}
	}

	@Post('create')
	@JwtAccess(Role.MEMBER)
	@ApiSuccessResponse(CreateOrderDTO)
	async createOrder(
		@CurrentUser('sub') memberId: string,
		@Body() body: CreateOrderDTO
	) {
		const createdOrder = await this.orderService.createMemberOrder(
			memberId,
			body
		)
		return { id: createdOrder._id }
	}

	@Post(':orderId/review')
	@JwtAccess(Role.MEMBER)
	@ApiResponse({ type: BooleanResponseDTO, status: 201 })
	async reviewOrder(
		@CurrentUser('sub') memberId: string,
		@Param('orderId', ObjectIdPipe) orderId: string,
		@Body() body: ReviewOrderDTO
	) {
		return await this.orderService.createOrderReview(memberId, orderId, body)
	}

	@Get(':orderId')
	@JwtAccess(Role.MEMBER)
	@ApiSuccessResponse(GetOrderDetailDTO)
	async getCartDetail(
		@CurrentUser('sub') memberId: string,
		@Param('orderId', ObjectIdPipe) orderId: string
	) {
		return await this.orderService.getOrderDetail(memberId, orderId)
	}
}
import { CurrentUser, JwtAccess } from '@app/authentication'
import {
	ApiSuccessResponse,
	MemberServerSocketClientService,
	ObjectIdPipe,
	OrderState,
	PaymentType,
	Role,
	ShippingMethod,
} from '@app/common'
import { BooleanResponseDTO } from '@app/types'
import {
	Body,
	Controller,
	Get,
	Logger,
	Param,
	Patch,
	Post,
} from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'

import { CheckVoucherDTO } from '../dto/check-voucher.dto'
import { CreateOrderDTO } from '../dto/create-order.dto'
import {
	GetOrderDetailDTO,
	GetProductPriceApplyingVoucherDTO,
} from '../dto/response.dto'
import { ReviewOrderDTO } from '../dto/review-order.dto'
import { OrderService } from '../services/order.service'
import { ReviewShipperDTO } from '../dto/review-shipper.dto'
import { OrderStateService } from '../services/order-state.service'

@Controller('member/cart')
@ApiTags('member-app > order')
export class OrderController {
	constructor(
		private readonly orderService: OrderService,
		private readonly orderStateService: OrderStateService,
		private readonly socketClient: MemberServerSocketClientService
	) {}

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
		if (
			createdOrder.type === ShippingMethod.DELIVERY &&
			createdOrder.payment === PaymentType.CAST
		) {
			Logger.verbose(
				`Đơn hàng ${createdOrder._id.toString()} sẽ tự động xác nhận sau 1 phút`
			)
			setTimeout(() => {
				this.orderStateService.updateOrderState(
					createdOrder._id.toString(),
					OrderState.PROCESSING,
					{
						title: 'Đơn hàng đã xác nhận',
						description: `Đơn hàng được tự động xác nhận sau một phút`,
					}
				)
			}, 60000)
		}
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

	@Post(':orderId/review-shipper')
	@JwtAccess(Role.MEMBER)
	@ApiResponse({ type: BooleanResponseDTO, status: 201 })
	async reviewShipper(
		@CurrentUser('sub') memberId: string,
		@Param('orderId', ObjectIdPipe) orderId: string,
		@Body() body: ReviewShipperDTO
	) {
		return await this.orderService.createShipperReview(memberId, orderId, body)
	}

	@Patch(':orderId/cancel')
	@JwtAccess(Role.MEMBER)
	@ApiResponse({ type: BooleanResponseDTO, status: 200 })
	async cancelOrder(
		@CurrentUser('sub') memberId: string,
		@Param('orderId', ObjectIdPipe) orderId: string
	) {
		const isDeleted = await this.orderService.cancelOrder(memberId, orderId)

		if (isDeleted) {
			this.socketClient
				.getSocket()
				.emit('member-server:cancel_order', { orderId })
		}

		return isDeleted
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

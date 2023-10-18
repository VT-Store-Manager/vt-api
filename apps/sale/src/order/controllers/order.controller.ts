import { CurrentUser, JwtAccess } from '@app/authentication'
import {
	ApiSuccessResponse,
	ObjectIdPipe,
	Role,
	ShippingMethod,
} from '@app/common'
import { MongoSessionService, Order } from '@app/database'
import { BooleanResponseDTO } from '@app/types'
import {
	Body,
	Controller,
	Get,
	InternalServerErrorException,
	Param,
	Patch,
	Post,
} from '@nestjs/common'
import { ApiResponse, ApiTags, OmitType } from '@nestjs/swagger'

import { CreateOrderDTO } from '../dto/create-order.dto'
import {
	CreateOrderResponseDTO,
	GetOrderDetailDTO,
	SuggestVoucherItemDTO,
} from '../dto/response.dto'
import { UpdateOrderStateDTO } from '../dto/update-order-state.dto'
import { OrderService } from '../services/order.service'
import { GetSuggestVoucherDTO } from '../dto/get-suggest-voucher.dto'
import { ValidateVoucherDTO } from '../dto/validate-voucher.dto'
import { CheckVoucherDTO } from '../dto/check-voucher.dto'

@Controller('sale/cart')
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

	@Post('suggest-voucher')
	@JwtAccess(Role.SALESPERSON)
	@ApiSuccessResponse(SuggestVoucherItemDTO, 201, true)
	async getSuggestVouchers(
		@CurrentUser('sub') storeId: string,
		@Body() body: GetSuggestVoucherDTO
	): Promise<SuggestVoucherItemDTO[]> {
		const availableVoucherIds = await this.orderService.getAvailableVoucherList(
			body.userId
		)
		return await this.orderService.getSuggestVoucherList(
			availableVoucherIds,
			storeId,
			body
		)
	}

	@Post('validate-voucher')
	@JwtAccess(Role.SALESPERSON)
	@ApiSuccessResponse(OmitType(SuggestVoucherItemDTO, ['voucherId']), 201)
	async checkVoucher(
		@CurrentUser('sub') storeId: string,
		@Body() body: ValidateVoucherDTO
	): Promise<Omit<SuggestVoucherItemDTO, 'voucherId'>> {
		const checkVoucherData: CheckVoucherDTO = {
			storeId,
			voucherId: body.voucherId,
			categoryId: ShippingMethod.IN_STORE,
			products: body.products,
		}
		const applyVoucherResult = await this.orderService.validateVoucher(
			storeId,
			checkVoucherData
		)
		const totalCost = applyVoucherResult.products.reduce((res, product) => {
			const productPrice =
				product.quantity * (product.mainPrice + product.extraPrice) -
				product.discountPrice
			return res + productPrice
		}, 0)
		const voucherDiscount =
			applyVoucherResult.totalDiscount ||
			applyVoucherResult.products.reduce((res, product) => {
				return res + product.discountPrice
			}, 0)
		const products = applyVoucherResult.products.map(product => ({
			id: product.id,
			cost: (product.mainPrice + product.extraPrice) * product.quantity,
			discount: product.discountPrice,
		}))

		return {
			cost: totalCost,
			voucherDiscount,
			products,
		}
	}

	@Get(':id')
	@JwtAccess(Role.SALESPERSON)
	@ApiSuccessResponse(GetOrderDetailDTO)
	async getCartDetail(
		@CurrentUser('sub') storeId: string,
		@Param('id', ObjectIdPipe) orderId: string
	) {
		return await this.orderService.getOrderDetail(storeId, orderId)
	}
}

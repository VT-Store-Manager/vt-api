import { CurrentUser, JwtAccess } from '@app/authentication'
import {
	ApiSuccessResponse,
	CheckTransactionStatusResultModel,
	MomoCreatePaymentResponse,
	MomoService,
	ObjectIdPipe,
	RemoveNullishObjectPipe,
	Role,
} from '@app/common'
import { Body, Controller, Param, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import {
	CheckTransactionStatusDTO,
	CreateMomoPaymentDTO,
} from '../dto/request.dto'

@Controller('momo')
@ApiTags('member-app > momo')
export class MomoController {
	constructor(private readonly momoService: MomoService) {}

	@JwtAccess(Role.MEMBER)
	@Post(':orderId/create-payment')
	@ApiSuccessResponse(MomoCreatePaymentResponse, 201)
	async createPayment(
		@Param('orderId', ObjectIdPipe) orderId: string,
		@Body(RemoveNullishObjectPipe) body: CreateMomoPaymentDTO,
		@CurrentUser('sub') memberId: string
	) {
		const createPaymentBody = await this.momoService.getPaymentPayment(
			orderId,
			memberId,
			body
		)
		const createResponse = await this.momoService.createMomoPayment(
			createPaymentBody,
			orderId
		)
		return createResponse.data
	}

	@JwtAccess(Role.MEMBER)
	@Post(':orderId/transaction-status')
	@ApiSuccessResponse(CheckTransactionStatusResultModel, 201)
	async checkTransactionStatus(
		@Param('orderId', ObjectIdPipe) orderId: string,
		@Body(RemoveNullishObjectPipe) body: CheckTransactionStatusDTO,
		@CurrentUser('sub') memberId: string
	) {
		return await this.momoService.checkTransactionStatus(
			orderId,
			memberId,
			body
		)
	}
}

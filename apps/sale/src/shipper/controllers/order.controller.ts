import { BooleanResponseDTO } from '@/libs/types/src'
import { CurrentUser, JwtAccess } from '@app/authentication'
import {
	ApiSuccessResponse,
	FileService,
	ObjectIdPipe,
	ParseFile,
	Role,
} from '@app/common'
import { MongoSessionService } from '@app/database'
import {
	Body,
	Controller,
	Get,
	InternalServerErrorException,
	Param,
	Patch,
	Post,
	Query,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger'

import { GetOrderListDTO } from '../dto/get-order-list.dto'
import { GetPendingOrderListDTO } from '../dto/get-pending-order-list.dto'
import {
	CurrentOrderShortDTO,
	OrderDetailDTO,
	OrderListPaginationResultDTO,
} from '../dto/response.dto'
import { UpdateShipperOrderStateDTO } from '../dto/update-shipper-order-state.dto'
import { ShipperOrderService } from '../services/order.service'
import {
	UploadEvidenceBodyDTO,
	UploadEvidenceDTO,
} from '../dto/upload-evidence.dto'

@Controller('shipper/order')
@ApiTags('shipper-app > order')
export class ShipperOrderController {
	constructor(
		private readonly orderService: ShipperOrderService,
		private readonly fileService: FileService,
		private readonly mongoSessionService: MongoSessionService
	) {}

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

	@Post(':id/evidence')
	@JwtAccess(Role.SHIPPER)
	@UseInterceptors(FileInterceptor('image'))
	@ApiConsumes('multipart/form-data')
	@ApiResponse({ type: BooleanResponseDTO, status: 201 })
	async uploadEvidence(
		@UploadedFile(ParseFile) image: Express.Multer.File,
		@CurrentUser('sub') shipperId: string,
		@Param('id', ObjectIdPipe) orderId: string,
		@Body() _body: UploadEvidenceBodyDTO
	) {
		const imageKey = this.fileService.createObjectKey(
			['order', 'evidence'],
			image.originalname
		)

		const abortController = new AbortController()

		let isSuccess: boolean
		let oldEvidence: string
		const { error } = await this.mongoSessionService.execTransaction(
			async session => {
				const payload: UploadEvidenceDTO = {
					image: imageKey,
					orderId,
					shipperId,
				}
				const [updateResult] = await Promise.all([
					this.orderService.uploadEvidence(payload, session),
					this.fileService.upload(image.buffer, imageKey, abortController),
				])
				isSuccess = updateResult.success
				oldEvidence = updateResult.oldEvidence
			}
		)

		if (error || !isSuccess) {
			abortController.abort()
			this.fileService.delete([imageKey])
			if (error) throw error
			throw new InternalServerErrorException(
				'Tải bằng chứng giao hàng thất bại'
			)
		}

		if (oldEvidence) {
			this.fileService.delete([oldEvidence])
		}

		return true
	}
}

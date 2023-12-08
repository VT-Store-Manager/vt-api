import { Request } from 'express'

import {
	MomoProcessPaymentResult,
	MomoService,
	ObjectIdPipe,
	StoreSocketClientService,
} from '@app/common'
import { Controller, Param, Post, Req } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

@Controller('momo')
@ApiTags('member-app > momo')
export class MomoController {
	constructor(
		private readonly momoService: MomoService,
		private readonly socketClient: StoreSocketClientService
	) {}

	@Post(':orderId/ipn')
	async paymentNotification(
		@Param('orderId', ObjectIdPipe) orderId: string,
		@Req() { body }: Request<any, any, MomoProcessPaymentResult>
	) {
		const result = await this.momoService.updatePaymentResult(body, orderId)
		this.socketClient.getSocket().emit('member-server:paid_order', {
			orderId,
		})
		return result
	}
}

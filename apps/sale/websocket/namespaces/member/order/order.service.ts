import { Injectable } from '@nestjs/common'
import { OrderService } from '@sale/src/order/services/order.service'

@Injectable()
export class WsMemberOrderService {
	constructor(private readonly orderService: OrderService) {}
}

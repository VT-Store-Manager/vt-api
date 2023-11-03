import { Module } from '@nestjs/common'
import { OrderModule } from '@sale/src/order/order.module'

import { MemberOrderGateway } from './order.gateway'
import { WsMemberOrderService } from './order.service'

@Module({
	imports: [OrderModule],
	providers: [MemberOrderGateway, WsMemberOrderService],
})
export class MemberOrderModule {}

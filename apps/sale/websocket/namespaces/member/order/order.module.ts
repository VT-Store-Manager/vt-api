import { Module } from '@nestjs/common'
import { OrderModule } from '@sale/src/order/order.module'

import { MemberOrderGateway } from './order.gateway'

@Module({
	imports: [OrderModule],
	providers: [MemberOrderGateway],
})
export class MemberOrderModule {}

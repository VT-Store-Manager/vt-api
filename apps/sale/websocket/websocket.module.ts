import { Module } from '@nestjs/common'
import { MemberOrderModule } from './member/order/order.module'
import { MemberConnectionModule } from './member/connection/connection.module'

@Module({
	imports: [MemberOrderModule, MemberConnectionModule],
})
export class WebSocketModule {}

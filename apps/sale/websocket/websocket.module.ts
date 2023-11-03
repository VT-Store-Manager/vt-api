import { Module } from '@nestjs/common'

import { MemberConnectionModule } from './connection/connection.module'
import { WsOrderModule } from './order/order.module'

@Module({
	imports: [MemberConnectionModule, WsOrderModule],
})
export class WebSocketModule {}

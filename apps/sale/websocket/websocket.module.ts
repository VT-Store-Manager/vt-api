import { Module } from '@nestjs/common'

import { ConnectionModule } from './connection/connection.module'
import { WsOrderModule } from './order/order.module'
import { WsStreamModule } from './stream/stream.module'

@Module({
	imports: [ConnectionModule, WsStreamModule, WsOrderModule],
})
export class WebSocketModule {}

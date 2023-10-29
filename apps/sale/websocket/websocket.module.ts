import { Module } from '@nestjs/common'

import { MemberConnectionModule } from './connection/connection.module'
import { MemberOrderModule } from './namespaces/member/order/order.module'

@Module({
	imports: [MemberConnectionModule, MemberOrderModule],
})
export class WebSocketModule {}

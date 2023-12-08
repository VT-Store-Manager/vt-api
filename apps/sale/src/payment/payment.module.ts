import { MomoModule, SocketClientModule, WsNamespace } from '@app/common'
import { Module } from '@nestjs/common'

import { MomoController } from './controllers/momo.controller'

@Module({
	imports: [MomoModule, SocketClientModule.register(WsNamespace.STORE)],
	controllers: [MomoController],
})
export class PaymentModule {}

import { Module } from '@nestjs/common'

import { MemberServerSocketClientService } from './member-client.service'
import { StoreSocketClientService } from './store-client.service'

@Module({
	providers: [MemberServerSocketClientService, StoreSocketClientService],
	exports: [MemberServerSocketClientService, StoreSocketClientService],
})
export class SocketClientModule {}

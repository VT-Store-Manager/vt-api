import { Module } from '@nestjs/common'
import { MemberSocketClientService } from './member-socket-client.service'

@Module({
	providers: [MemberSocketClientService],
	exports: [MemberSocketClientService],
})
export class SocketClientModule {}

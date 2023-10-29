import { Module } from '@nestjs/common'
import { MemberOrderGateway } from './order.gateway'

@Module({
	providers: [MemberOrderGateway],
})
export class MemberOrderModule {}

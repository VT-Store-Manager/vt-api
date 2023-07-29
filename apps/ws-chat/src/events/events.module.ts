import { Module } from '@nestjs/common'

import { UserModule } from '../user/user.module'
import { ChatGateway } from './chat.gateway'
import { OnlineGateway } from './online.gateway'

@Module({
	imports: [UserModule],
	providers: [OnlineGateway, ChatGateway],
})
export class EventsModule {}

import { Module } from '@nestjs/common'

import { ChatModule } from './events/chat.module'

@Module({
	imports: [ChatModule],
})
export class AppModule {}

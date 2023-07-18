import { WsAdapter } from '@nestjs/platform-ws'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	// app.useWebSocketAdapter(new WsAdapter(app))
	app.useWebSocketAdapter(new IoAdapter(app))

	await app.listen(80)
}
bootstrap()

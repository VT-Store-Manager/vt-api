import { IoAdapter } from '@nestjs/platform-socket.io'
import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'
import { Logger } from '@nestjs/common'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	app.useWebSocketAdapter(new IoAdapter(app))
	app.setGlobalPrefix('/api')
	app.enableCors({
		origin: '*',
	})

	await app.listen(80)
	Logger.log(`Nest application: http://localhost`, 'NestApplication')
	Logger.log(`Websocket server: ws://localhost:9000`, 'NestApplication')
}
bootstrap()

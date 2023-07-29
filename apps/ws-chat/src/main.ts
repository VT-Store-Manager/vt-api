import { IoAdapter } from '@nestjs/platform-socket.io'
import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	app.useWebSocketAdapter(new IoAdapter(app))
	app.setGlobalPrefix('/api')
	app.enableCors({
		origin: '*',
	})

	await app.listen(80)
}
bootstrap()

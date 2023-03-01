import compression from 'compression'
import morgan from 'morgan'

import { AppModule } from '@/app/app.module'
import SwaggerConfig from '@/config/swagger'
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	const configService = app.get(ConfigService)

	app.use(morgan('tiny'))
	app.use(compression())

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
		})
	)

	app.setGlobalPrefix('api')
	app.enableVersioning({
		type: VersioningType.URI,
	})

	SwaggerConfig(app)

	const port = configService.get<number>('port') || process.env.PORT || 8080
	const nodeEnv = configService.get<string>('nodeEnv')
	await app.listen(port, () => {
		if (!nodeEnv || nodeEnv === 'development') {
			Logger.debug(`Server runs at http://localhost:${port}/api/v1`, 'Server')
			Logger.debug(`OpenAPI viewed at http://localhost:${port}/api`, 'Swagger')
		}
	})
}
bootstrap()

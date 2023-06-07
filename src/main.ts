import compression from 'compression'
import morgan from 'morgan'

import awsS3Config from '@/config/s3'
import SwaggerConfig from '@/config/swagger'
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'

import { AppModule } from './app/app.module'
import { NodeEnv } from './common/constants'

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		logger: ['error', 'warn', 'debug', 'verbose'],
	})
	const configService = app.get(ConfigService)

	app.enableCors({ origin: '*' })
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
	await awsS3Config(
		configService.get<string>('aws.region'),
		configService.get<string>('aws.accessKeyId'),
		configService.get<string>('aws.secretAccessKey'),
		configService.get<string>('aws.bucketName')
	)

	const host = configService.get<string>('host')
	const port = configService.get<string>('port')
	const nodeEnv = configService.get<string>('nodeEnv')
	await app.listen(port, () => {
		if (nodeEnv === NodeEnv.DEVELOPMENT) {
			Logger.debug(`Nest application runs at ${host}`, 'NestApplication')
			Logger.debug(`Swagger viewed at ${host}/api`, 'OpenAPI')
		}
	})
}
bootstrap()

import compression from 'compression'

import { NodeEnv } from '@app/common'
import { awsS3Config, morganConfig, swaggerConfig } from '@app/config'
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'

import { ClientApiModule } from './client-api.module'

async function bootstrap() {
	const app = await NestFactory.create(ClientApiModule)
	const configService = app.get(ConfigService)

	app.enableCors({ origin: '*' })
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
		defaultVersion: '1',
	})

	swaggerConfig(app, {
		title: 'Client APIs',
		description: '',
	})
	await awsS3Config(
		configService.get<string>('aws.region'),
		configService.get<string>('aws.accessKeyId'),
		configService.get<string>('aws.secretAccessKey'),
		configService.get<string>('aws.bucketName')
	)
	morganConfig(app)

	const host = configService.get<string>('host')
	const port =
		configService.get<string>('port') || process.env.CLIENT_PORT || 8080
	const nodeEnv = configService.get<string>('nodeEnv')
	await app.listen(port, () => {
		if (nodeEnv === NodeEnv.DEVELOPMENT) {
			Logger.debug(
				`Nest application runs at ${host}:${port}`,
				'NestApplication'
			)
			Logger.debug(`Swagger viewed at ${host}:${port}/api`, 'OpenAPI')
		}
	})
}
bootstrap()

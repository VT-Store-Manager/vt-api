import compression from 'compression'

import { NodeEnv } from '@app/common'
import { awsS3Config, morganConfig, swaggerConfig } from '@app/config'
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'

import { SaleApiModule } from './sale-api.module'

async function bootstrap() {
	const app = await NestFactory.create(SaleApiModule, {
		logger: ['error', 'warn', 'debug', 'verbose'],
	})
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
		title: 'Sale APIs',
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
		configService.get<string>('port') || process.env.SALE_PORT || 8082
	const nodeEnv = configService.get<string>('nodeEnv')
	await app.listen(port, () => {
		if (nodeEnv === NodeEnv.DEVELOPMENT) {
			Logger.debug(
				`Nest application runs at http://${host}:${port}`,
				'NestApplication'
			)
			Logger.debug(`Swagger viewed at http://${host}:${port}/api`, 'OpenAPI')
		}
	})
}
bootstrap()

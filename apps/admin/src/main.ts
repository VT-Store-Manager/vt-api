import compression from 'compression'

import { AppVersion, NodeEnv } from '@app/common'
import { awsS3Config, morganConfig, swaggerConfig } from '@app/config'
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'

import { AdminApiModule } from './admin.module'

async function bootstrap() {
	const app = await NestFactory.create(AdminApiModule)
	const configService = app.get(ConfigService)

	const nodeEnv = configService.get<NodeEnv>('nodeEnv')
	if (nodeEnv === NodeEnv.PRODUCTION) {
		app.useLogger(['error', 'warn', 'log'])
	}

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
		defaultVersion: AppVersion.ADMIN,
	})

	swaggerConfig(app, {
		title: 'Admin APIs',
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
		configService.get<string>('port') || process.env.ADMIN_PORT || 8081
	await app.listen(port, () => {
		if (nodeEnv === NodeEnv.DEVELOPMENT) {
			Logger.log(
				`Nest application runs at http://${host}:${port}`,
				'NestApplication'
			)
			Logger.log(`Swagger viewed at http://${host}:${port}/api`, 'OpenAPI')
		}
	})
}
bootstrap()

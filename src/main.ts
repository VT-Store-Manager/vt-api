import compression from 'compression'
import morgan from 'morgan'

import { AppModule } from '@/app/app.module'
import awsS3Config from '@/config/aws-s3'
import SwaggerConfig from '@/config/swagger'
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	const configService = app.get(ConfigService)

	app.enableCors()
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

	const port = configService.get<number>('port') || process.env.PORT || 8080
	const nodeEnv = configService.get<string>('nodeEnv')
	await app.listen(port, () => {
		if (!nodeEnv || nodeEnv === 'development') {
			Logger.debug(
				`Nest application runs at http://localhost:${port}/api/v1`,
				'NestApplication'
			)
			Logger.debug(`Swagger viewed at http://localhost:${port}/api`, 'OpenAPI')
		}
	})
}
bootstrap()

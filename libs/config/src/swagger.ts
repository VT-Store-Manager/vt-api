import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

export const swaggerConfig = (
	app: INestApplication,
	options: {
		title?: string
		description?: string
		version?: string
	} = {}
) => {
	const config = new DocumentBuilder()
		.addBearerAuth()
		.setTitle(options.title ?? 'VT Store API')
		.setDescription(options.description ?? 'VT Store API description')
		.setVersion(options.version ?? '1.0')
		.build()
	const document = SwaggerModule.createDocument(app, config)
	SwaggerModule.setup('api', app, document, {
		swaggerOptions: {
			tagsSorter: 'alpha',
			operationsSorter: 'alpha',
		},
	})
}

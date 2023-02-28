import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

export default (app: INestApplication) => {
	const config = new DocumentBuilder()
		.setTitle('VT Store API')
		.setDescription('VT Store API description')
		.setVersion('1.0')
		.build()
	const document = SwaggerModule.createDocument(app, config)
	SwaggerModule.setup('api', app, document)
}

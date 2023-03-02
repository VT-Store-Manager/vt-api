import { ClassValidatorExceptionFilter } from '@/common/filters/class-validator-exception.filter'
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter'
import { MongoExceptionFilter } from '@/common/filters/mongo-exception.filter'
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor'
import { envConfiguration, envValidationSchema } from '@/config/configuration'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UserModule } from './user/user.module'

@Module({
	imports: [
		MongooseModule.forRootAsync({
			useFactory: async (
				configService: ConfigService
			): Promise<MongooseModuleOptions> => ({
				uri: configService.get<string>('database.url'),
			}),
			inject: [ConfigService],
		}),
		UserModule,
		ConfigModule.forRoot({
			isGlobal: true,
			load: [envConfiguration],
			validationSchema: envValidationSchema,
		}),
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_FILTER,
			useClass: HttpExceptionFilter,
		},
		{
			provide: APP_FILTER,
			useClass: MongoExceptionFilter,
		},
		{
			provide: APP_FILTER,
			useClass: ClassValidatorExceptionFilter,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: TransformInterceptor,
		},
	],
})
export class AppModule {}

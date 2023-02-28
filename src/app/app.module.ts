import { HttpExceptionFilter } from '@/common/filters/http-exception.filter'
import { MongoExceptionFilter } from '@/common/filters/mongo-exception.filter'
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor'
import configuration from '@/config/configuration'
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
			load: [configuration],
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
			provide: APP_INTERCEPTOR,
			useClass: TransformInterceptor,
		},
	],
})
export class AppModule {}

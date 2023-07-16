import { Connection } from 'mongoose'
import { join } from 'path'

import { ClassValidatorExceptionFilter } from '@/common/filters/class-validator-exception.filter'
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter'
import { MongoExceptionFilter } from '@/common/filters/mongo-exception.filter'
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor'
import { envConfiguration, envValidationSchema } from '@/config/configuration'
import { Logger, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import {
	InjectConnection,
	MongooseModule,
	MongooseModuleOptions,
} from '@nestjs/mongoose'
import { ServeStaticModule } from '@nestjs/serve-static'

import { AdminAppModule } from './admin/admin-app.module'
import { ClientAppModule } from './client/client-app.module'
import { CounterModule } from './modules/counter/counter.module'
import { FileModule } from './modules/file/file.module'
import { SettingModule } from './modules/setting/setting.module'
import { SaleAppModule } from './sale/sale-app.module'
import { TriggerModule } from './triggers/trigger.module'

@Module({
	imports: [
		MongooseModule.forRootAsync({
			useFactory: async (
				configService: ConfigService
			): Promise<MongooseModuleOptions> => ({
				uri: configService.get<string>('database.url'),
				dbName: configService.get<string>('database.db'),
			}),
			inject: [ConfigService],
		}),
		ConfigModule.forRoot({
			isGlobal: true,
			load: [envConfiguration],
			validationSchema: envValidationSchema,
			cache: true,
		}),
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '..', '..', 'public'),
			serveRoot: '/',
			serveStaticOptions: {
				cacheControl: true,
			},
		}),
		FileModule,
		CounterModule,
		SettingModule,
		TriggerModule,
		ClientAppModule,
		AdminAppModule,
		SaleAppModule,
	],
	controllers: [],
	providers: [
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
export class AppModule {
	constructor(@InjectConnection() private readonly connection: Connection) {
		const connectedLog = () => {
			Logger.debug('Database connected', 'MongoDBServer')
		}
		switch (this.connection.readyState) {
			case 0:
				this.connection.once('connection', connectedLog)
				break
			case 1:
				connectedLog()
				break
			case 2:
				Logger.debug('Database is connecting...', 'MongoDBServer')
				this.connection.once('connection', connectedLog)
				break
			case 3:
				Logger.debug('Database is disconnecting...', 'MongoDBServer')
				break
		}
	}
}

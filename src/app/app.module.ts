import configuration from '@/config/configuration'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
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
	providers: [AppService],
})
export class AppModule {}

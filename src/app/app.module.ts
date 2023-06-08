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

import { CounterModule } from './modules/counter/counter.module'
import { FileModule } from './modules/file/file.module'
import { MemberVoucherModule } from './modules/member-voucher/member-voucher.module'
import { NewsModule } from './modules/news/news.module'
import { NotificationModule } from './modules/notification/notification.module'
import { OrderModule } from './modules/order/order.module'
import { PartnerModule } from './modules/partner/partner.module'
import { ProductCategoryModule } from './modules/product-category/product-category.module'
import { ProductOptionModule } from './modules/product-option/product-option.module'
import { ProductModule } from './modules/product/product.module'
import { PromotionCategoryModule } from './modules/promotion-category/promotion-category.module'
import { PromotionModule } from './modules/promotion/promotion.module'
import { RankModule } from './modules/rank/rank.module'
import { SettingModule } from './modules/setting/setting.module'
import { StoreModule } from './modules/store/store.module'
import { TagModule } from './modules/tag/tag.module'
import { VoucherModule } from './modules/voucher/voucher.module'
import { TriggerModule } from './triggers/trigger.module'
import { MemberAppModule } from './member/member-app.module'

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
		ProductCategoryModule,
		ProductOptionModule,
		ProductModule,
		StoreModule,
		RankModule,
		VoucherModule,
		MemberVoucherModule,
		PromotionModule,
		PromotionCategoryModule,
		OrderModule,
		SettingModule,
		PartnerModule,
		NotificationModule,
		TriggerModule,
		NewsModule,
		TagModule,
		MemberAppModule,
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

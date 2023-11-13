import { Connection } from 'mongoose'
import { join } from 'path'

import {
	ClassValidatorExceptionFilter,
	FileModule,
	HttpExceptionFilter,
	MongoExceptionFilter,
	TransformInterceptor,
} from '@app/common'
import { envConfiguration, envValidationSchema } from '@app/config'
import { Logger, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import {
	InjectConnection,
	MongooseModule,
	MongooseModuleOptions,
} from '@nestjs/mongoose'
import { ServeStaticModule } from '@nestjs/serve-static'

import { MemberVoucherModule } from './member-voucher/member-voucher.module'
import { MemberModule } from './member/member.module'
import { NewsModule } from './news/news.module'
import { NotificationModule } from './notification/notification.module'
import { OrderModule } from './order/order.module'
import { PartnerModule } from './partner/partner.module'
import { ProductCategoryModule } from './product-category/product-category.module'
import { ProductOptionModule } from './product-option/product-option.module'
import { ProductModule } from './product/product.module'
import { PromotionCategoryModule } from './promotion-category/promotion-category.module'
import { PromotionModule } from './promotion/promotion.module'
import { RankModule } from './rank/rank.module'
import { StatisticModule } from './statistic/statistic.module'
import { StoreModule } from './store/store.module'
import { TagModule } from './tag/tag.module'
import { VoucherModule } from './voucher/voucher.module'
import { AccountAdminModule } from './account-admin/account-admin.module'
import { AuthModule } from './auth/auth.module'
import { CaslModule } from './casl/casl.module'
import { ShipperModule } from './shipper/shipper.module'
import { EmployeeModule } from './employee/employee.module'
import { AccountSaleModule } from './account-sale/account-sale.module'

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
			rootPath: join(__dirname, '..', '..', '..', 'public'),
			serveRoot: '/',
			serveStaticOptions: {
				cacheControl: true,
			},
		}),
		FileModule,
		AuthModule,
		AccountAdminModule,
		MemberModule,
		MemberVoucherModule,
		NewsModule,
		NotificationModule,
		OrderModule,
		PartnerModule,
		ProductModule,
		ProductCategoryModule,
		ProductOptionModule,
		PromotionModule,
		PromotionCategoryModule,
		RankModule,
		StatisticModule,
		StoreModule,
		TagModule,
		VoucherModule,
		CaslModule,
		ShipperModule,
		EmployeeModule,
		AccountSaleModule,
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
export class AdminApiModule {
	constructor(@InjectConnection() private readonly connection: Connection) {
		const connectedLog = () => {
			Logger.log('Database connected', 'MongoDBServer')
		}
		switch (this.connection.readyState) {
			case 0:
				this.connection.once('connection', connectedLog)
				break
			case 1:
				connectedLog()
				break
			case 2:
				Logger.log('Database is connecting...', 'MongoDBServer')
				this.connection.once('connection', connectedLog)
				break
			case 3:
				Logger.log('Database is disconnecting...', 'MongoDBServer')
				break
		}
	}
}

import { envConfiguration, envValidationSchema } from '@app/config'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose'

import { OrderBuyer, SettingType } from '../../common/src'
import { AccountSale, AccountSaleSchema } from './schemas/account-sale.schema'
import {
	CartTemplate,
	CartTemplateSchema,
} from './schemas/cart-template.schema'
import { Counter, CounterSchema } from './schemas/counter.schema'
import { MemberData, MemberDataSchema } from './schemas/member-data.schema'
import {
	MemberNotification,
	MemberNotificationSchema,
} from './schemas/member-notification.schema'
import {
	MemberPromotionHistory,
	MemberPromotionHistorySchema,
} from './schemas/member-promotion-history.schema'
import { MemberRank, MemberRankSchema } from './schemas/member-rank.schema'
import {
	MemberVoucherHistory,
	MemberVoucherHistorySchema,
} from './schemas/member-voucher-history.schema'
import {
	MemberVoucher,
	MemberVoucherSchema,
} from './schemas/member-voucher.schema'
import { Member, MemberSchema } from './schemas/member.schema'
import { News, NewsSchema } from './schemas/news.schema'
import { NotificationSchema } from './schemas/notification.schema'
import { OrderCustomerSchema } from './schemas/order-customer.schema'
import { OrderMemberSchema } from './schemas/order-member.schema'
import { Order, OrderSchema } from './schemas/order.schema'
import { Partner, PartnerSchema } from './schemas/partner.schema'
import {
	ProductCategory,
	ProductCategorySchema,
} from './schemas/product-category.schema'
import {
	ProductOption,
	ProductOptionSchema,
} from './schemas/product-option.schema'
import { Product, ProductSchema } from './schemas/product.schema'
import {
	PromotionCategory,
	PromotionCategorySchema,
} from './schemas/promotion-category.schema'
import { Promotion, PromotionSchema } from './schemas/promotion.schema'
import { Rank, RankSchema } from './schemas/rank.schema'
import {
	RefreshToken,
	RefreshTokenSchema,
} from './schemas/refresh-token.schema'
import { SettingGeneralSchema } from './schemas/setting-general.schema'
import { SettingMemberAppSchema } from './schemas/setting-member-app.schema'
import { Setting, SettingSchema } from './schemas/setting.schema'
import { Store, StoreSchema } from './schemas/store.schema'
import { Tag, TagSchema } from './schemas/tag.schema'
import { TimerFlag, TimerFlagSchema } from './schemas/timer-flag.schema'
import { Voucher, VoucherSchema } from './schemas/voucher.schema'

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
			// isGlobal: true,
			load: [envConfiguration],
			validationSchema: envValidationSchema,
			cache: true,
		}),
		MongooseModule.forFeature([
			{ name: AccountSale.name, schema: AccountSaleSchema },
			{ name: CartTemplate.name, schema: CartTemplateSchema },
			{ name: Counter.name, schema: CounterSchema },
			{ name: Member.name, schema: MemberSchema },
			{ name: MemberData.name, schema: MemberDataSchema },
			{ name: MemberNotification.name, schema: MemberNotificationSchema },
			{
				name: MemberPromotionHistory.name,
				schema: MemberPromotionHistorySchema,
			},
			{ name: MemberRank.name, schema: MemberRankSchema },
			{ name: MemberVoucher.name, schema: MemberVoucherSchema },
			{ name: MemberVoucherHistory.name, schema: MemberVoucherHistorySchema },
			{ name: News.name, schema: NewsSchema },
			{ name: Notification.name, schema: NotificationSchema },
			{
				name: Order.name,
				schema: OrderSchema,
				discriminators: [
					{ name: OrderBuyer.CUSTOMER, schema: OrderCustomerSchema },
					{ name: OrderBuyer.MEMBER, schema: OrderMemberSchema },
				],
			},
			{ name: Partner.name, schema: PartnerSchema },
			{ name: Product.name, schema: ProductSchema },
			{ name: ProductCategory.name, schema: ProductCategorySchema },
			{ name: ProductOption.name, schema: ProductOptionSchema },
			{ name: PromotionCategory.name, schema: PromotionCategorySchema },
			{ name: Promotion.name, schema: PromotionSchema },
			{ name: Rank.name, schema: RankSchema },
			{ name: RefreshToken.name, schema: RefreshTokenSchema },
			{
				name: Setting.name,
				schema: SettingSchema,
				discriminators: [
					{ name: SettingType.GENERAL, schema: SettingGeneralSchema },
					{ name: SettingType.MEMBER_APP, schema: SettingMemberAppSchema },
				],
			},
			{ name: Store.name, schema: StoreSchema },
			{ name: Tag.name, schema: TagSchema },
			{ name: TimerFlag.name, schema: TimerFlagSchema },
			{ name: Voucher.name, schema: VoucherSchema },
		]),
	],
	providers: [],
	exports: [MongooseModule],
})
export class DatabaseModule {}

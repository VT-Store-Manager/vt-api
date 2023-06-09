import { Module } from '@nestjs/common'

import { AuthModule } from './auth/auth.module'
import { CartTemplateModule } from './cart-template/cart-template.module'
import { MemberDataModule } from './member-data/member-data.module'
import { MemberRankModule } from './member-rank/member-rank.module'
import { MemberVoucherModule } from './member-voucher/member-voucher.module'
import { MemberModule } from './member/member.module'
import { NewsModule } from './news/news.module'
import { NotificationModule } from './notification/notification.module'
import { OrderModule } from './order/order.module'
import { ProductCategoryModule } from './product-category/product-category.module'
import { ProductOptionModule } from './product-option/product-option.module'
import { ProductModule } from './product/product.module'
import { PromotionCategoryModule } from './promotion-category/promotion-category.module'
import { PromotionModule } from './promotion/promotion.module'
import { RankModule } from './rank/rank.module'
import { StoreModule } from './store/store.module'
import { VoucherModule } from './voucher/voucher.module'

@Module({
	imports: [
		AuthModule,
		CartTemplateModule,
		MemberModule,
		MemberDataModule,
		MemberRankModule,
		MemberVoucherModule,
		NewsModule,
		NotificationModule,
		OrderModule,
		ProductModule,
		ProductCategoryModule,
		ProductOptionModule,
		PromotionModule,
		PromotionCategoryModule,
		RankModule,
		StoreModule,
		VoucherModule,
	],
})
export class ClientAppModule {}
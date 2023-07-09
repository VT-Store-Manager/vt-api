import { Module } from '@nestjs/common'

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
import { StoreModule } from './store/store.module'
import { TagModule } from './tag/tag.module'
import { VoucherModule } from './voucher/voucher.module'

@Module({
	imports: [
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
		StoreModule,
		TagModule,
		VoucherModule,
	],
})
export class AdminAppModule {}

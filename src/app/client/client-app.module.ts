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
import { ProductModule } from './product/product.module'
import { ProductOptionModule } from './product-option/product-option.module'

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
	],
})
export class ClientAppModule {}

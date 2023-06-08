import { Module } from '@nestjs/common'

import { MemberVoucherModule } from './member-voucher/member-voucher.module'
import { NewsModule } from './news/news.module'
import { NotificationModule } from './notification/notification.module'
import { PartnerModule } from './partner/partner.module'
import { ProductModule } from './product/product.module'
import { ProductCategoryModule } from './product-category/product-category.module'
import { ProductOptionModule } from './product-option/product-option.module'

@Module({
	imports: [
		MemberVoucherModule,
		NewsModule,
		NotificationModule,
		PartnerModule,
		ProductModule,
		ProductCategoryModule,
		ProductOptionModule,
	],
})
export class AdminAppModule {}

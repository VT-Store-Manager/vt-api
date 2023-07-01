import { Module } from '@nestjs/common'

import { AuthModule } from './auth/auth.module'
import { ProductCategoryModule } from './product-category/product-category.module'
import { ProductOptionModule } from './product-option/product-option.module'
import { ProductModule } from './product/product.module'
import { OrderModule } from './order/order.module'

@Module({
	imports: [
		AuthModule,
		ProductCategoryModule,
		ProductOptionModule,
		ProductModule,
		OrderModule,
	],
})
export class SaleAppModule {}

import { Module } from '@nestjs/common'

import { AuthModule } from './auth/auth.module'
import { ProductCategoryModule } from './product-category/product-category.module'
import { ProductOptionModule } from './product-option/product-option.module'
import { ProductModule } from './product/product.module'

@Module({
	imports: [
		AuthModule,
		ProductCategoryModule,
		ProductOptionModule,
		ProductModule,
	],
})
export class SaleAppModule {}

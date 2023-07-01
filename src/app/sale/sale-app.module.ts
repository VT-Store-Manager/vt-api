import { Module } from '@nestjs/common'

import { AccountSaleModule } from './account/account.module'
import { ProductCategoryModule } from './product-category/product-category.module'
import { ProductOptionModule } from './product-option/product-option.module'

@Module({
	imports: [AccountSaleModule, ProductCategoryModule, ProductOptionModule],
})
export class SaleAppModule {}

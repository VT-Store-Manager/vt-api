import { Module } from '@nestjs/common'

import { AccountSaleModule } from './account/account.module'
import { ProductCategoryModule } from './product-category/product-category.module'

@Module({
	imports: [AccountSaleModule, ProductCategoryModule],
})
export class SaleAppModule {}

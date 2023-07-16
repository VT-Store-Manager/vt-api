import {
	ProductCategory,
	ProductCategorySchema,
} from '@/database/schemas/product-category.schema'
import { Product, ProductSchema } from '@/database/schemas/product.schema'
import { Store, StoreSchema } from '@/database/schemas/store.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { ProductCategoryController } from './product-category.controller'
import { ProductCategoryService } from './product-category.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: ProductCategory.name, schema: ProductCategorySchema },
			{ name: Product.name, schema: ProductSchema },
			{ name: Store.name, schema: StoreSchema },
		]),
	],
	controllers: [ProductCategoryController],
	providers: [ProductCategoryService],
})
export class ProductCategoryModule {}

import { CounterModule, FileService } from '@app/common'
import {
	MongoSessionService,
	Product,
	ProductCategory,
	ProductCategorySchema,
	ProductSchema,
	Store,
	StoreSchema,
} from '@app/database'
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
		CounterModule,
	],
	controllers: [ProductCategoryController],
	providers: [ProductCategoryService, FileService, MongoSessionService],
	exports: [ProductCategoryService, MongooseModule],
})
export class ProductCategoryModule {}

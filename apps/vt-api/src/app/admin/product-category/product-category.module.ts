import { CounterModule } from '@module/counter/counter.module'
import { FileService } from '@module/file/file.service'
import { MongoSessionService } from '@/common/providers/mongo-session.service'
import {
	ProductCategory,
	ProductCategorySchema,
} from '@schema/product-category.schema'
import { Product, ProductSchema } from '@schema/product.schema'
import { Store, StoreSchema } from '@schema/store.schema'
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
	exports: [ProductCategoryService],
})
export class ProductCategoryModule {}

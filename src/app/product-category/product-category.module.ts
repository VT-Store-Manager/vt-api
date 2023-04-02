import { CounterModule } from '@/app/counter/counter.module'
import { FileService } from '@/app/file/file.service'
import { MongoSessionService } from '@/providers/mongo/session.service'
import {
	ProductCategory,
	ProductCategorySchema,
} from '@/schemas/product-category.schema'
import { Product, ProductSchema } from '@/schemas/product.schema'
import { Store, StoreSchema } from '@/schemas/store.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { ProductCategoryController } from './admin-app/product-category.controller'
import { ProductCategoryService } from './admin-app/product-category.service'
import { ProductCategoryMemberController } from './member-app/product-category_member.controller'
import { ProductCategoryMemberService } from './member-app/product-category_member.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: ProductCategory.name, schema: ProductCategorySchema },
			{ name: Product.name, schema: ProductSchema },
			{ name: Store.name, schema: StoreSchema },
		]),
		CounterModule,
	],
	controllers: [ProductCategoryController, ProductCategoryMemberController],
	providers: [
		ProductCategoryService,
		ProductCategoryMemberService,
		FileService,
		MongoSessionService,
	],
	exports: [ProductCategoryService],
})
export class ProductCategoryModule {}

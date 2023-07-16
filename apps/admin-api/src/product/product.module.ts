import { CounterModule, FileService } from '@app/common'
import {
	Member,
	MemberData,
	MemberDataSchema,
	MemberSchema,
	MongoSessionService,
	Product,
	ProductSchema,
	Store,
	StoreSchema,
} from '@app/database'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { ProductCategoryModule } from '../product-category/product-category.module'
import { ProductOptionModule } from '../product-option/product-option.module'
import { ProductController } from './product.controller'
import { ProductService } from './product.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Product.name, schema: ProductSchema },
			{ name: Member.name, schema: MemberSchema },
			{ name: Store.name, schema: StoreSchema },
			{ name: MemberData.name, schema: MemberDataSchema },
		]),
		ProductCategoryModule,
		ProductOptionModule,
		CounterModule,
	],
	controllers: [ProductController],
	providers: [ProductService, FileService, MongoSessionService],
	exports: [ProductService],
})
export class ProductModule {}

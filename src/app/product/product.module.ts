import { MongoSessionService } from '@/providers/mongo/session.service'
import { Product, ProductSchema } from '@/schemas/product.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { CounterModule } from '../counter/counter.module'
import { FileService } from '../file/file.service'
import { ProductCategoryModule } from '../product-category/product-category.module'
import { ProductOptionModule } from '../product-option/product-option.module'
import { ProductController } from './admin/product.controller'
import { ProductService } from './admin/product.service'
import { ProductMemberController } from './member/product_member.controller'
import { ProductMemberService } from './member/product_member.service'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
		ProductCategoryModule,
		ProductOptionModule,
		CounterModule,
	],
	controllers: [ProductController, ProductMemberController],
	providers: [
		ProductService,
		ProductMemberService,
		FileService,
		MongoSessionService,
	],
	exports: [ProductService],
})
export class ProductModule {}

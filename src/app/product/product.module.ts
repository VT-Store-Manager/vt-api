import { MongoService } from '@/common/providers/mongo.service'
import { Product, ProductSchema } from '@/schemas/product.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { CounterModule } from '../counter/counter.module'
import { FileService } from '../file/file.service'
import { ProductCategoryModule } from '../product-category/product-category.module'
import { ProductOptionModule } from '../product-option/product-option.module'
import { ProductController } from './product.controller'
import { ProductService } from './product.service'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
		ProductCategoryModule,
		ProductOptionModule,
		CounterModule,
	],
	controllers: [ProductController],
	providers: [ProductService, FileService, MongoService],
})
export class ProductModule {}

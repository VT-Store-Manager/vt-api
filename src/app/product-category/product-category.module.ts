import { MongoService } from '@/providers/mongo.service'
import {
	ProductCategory,
	ProductCategorySchema,
} from '@/schemas/product-category.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { CounterModule } from '../counter/counter.module'
import { FileService } from '../file/file.service'
import { ProductCategoryController } from './product-category.controller'
import { ProductCategoryService } from './product-category.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: ProductCategory.name, schema: ProductCategorySchema },
		]),
		CounterModule,
	],
	controllers: [ProductCategoryController],
	providers: [ProductCategoryService, FileService, MongoService],
	exports: [ProductCategoryService],
})
export class ProductCategoryModule {}

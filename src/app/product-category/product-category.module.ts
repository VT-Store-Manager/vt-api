import { CounterModule } from '@/app/counter/counter.module'
import { FileService } from '@/app/file/file.service'
import { MongoSessionService } from '@/providers/mongo/session.service'
import {
	ProductCategory,
	ProductCategorySchema,
} from '@/schemas/product-category.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { ProductCategoryController } from './admin-app/product-category.controller'
import { ProductCategoryService } from './admin-app/product-category.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: ProductCategory.name, schema: ProductCategorySchema },
		]),
		CounterModule,
	],
	controllers: [ProductCategoryController],
	providers: [ProductCategoryService, FileService, MongoSessionService],
	exports: [ProductCategoryService],
})
export class ProductCategoryModule {}

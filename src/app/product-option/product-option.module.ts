import { MongoSessionService } from '@/providers/mongo/session.service'
import {
	ProductOption,
	ProductOptionSchema,
} from '@/schemas/product-option.schema'
import { Product, ProductSchema } from '@/schemas/product.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { CounterModule } from '../counter/counter.module'
import { ProductOptionController } from './product-option.controller'
import { ProductOptionService } from './product-option.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: ProductOption.name, schema: ProductOptionSchema },
			{ name: Product.name, schema: ProductSchema },
		]),
		CounterModule,
	],
	controllers: [ProductOptionController],
	providers: [ProductOptionService, MongoSessionService],
	exports: [ProductOptionService],
})
export class ProductOptionModule {}

import { MongoSessionService } from '@/common/providers/mongo-session.service'
import { CounterModule } from '@module/counter/counter.module'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
	ProductOption,
	ProductOptionSchema,
} from '@schema/product-option.schema'
import { Product, ProductSchema } from '@schema/product.schema'

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
})
export class ProductOptionModule {}

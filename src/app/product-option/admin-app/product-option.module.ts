import { CounterModule } from '@/app/counter/counter.module'
import { MongoSessionService } from '@/providers/mongo/session.service'
import {
	ProductOption,
	ProductOptionSchema,
} from '@/schemas/product-option.schema'
import { Product, ProductSchema } from '@/schemas/product.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { ProductOptionAdminController } from './product-option.controller'
import { ProductOptionAdminService } from './product-option.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: ProductOption.name, schema: ProductOptionSchema },
			{ name: Product.name, schema: ProductSchema },
		]),
		CounterModule,
	],
	controllers: [ProductOptionAdminController],
	providers: [ProductOptionAdminService, MongoSessionService],
	exports: [ProductOptionAdminService],
})
export class ProductOptionModule {}

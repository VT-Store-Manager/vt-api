import { CounterModule, MongoSessionService } from '@app/common'
import {
	Product,
	ProductOption,
	ProductOptionSchema,
	ProductSchema,
} from '@app/database'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

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

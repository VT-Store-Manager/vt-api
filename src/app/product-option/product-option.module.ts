import { MongoService } from '@/common/providers/mongo.service'
import {
	ProductOption,
	ProductOptionSchema,
} from '@/schemas/product-option.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { CounterModule } from '../counter/counter.module'
import { ProductOptionController } from './product-option.controller'
import { ProductOptionService } from './product-option.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: ProductOption.name, schema: ProductOptionSchema },
		]),
		CounterModule,
	],
	controllers: [ProductOptionController],
	providers: [ProductOptionService, MongoService],
	exports: [ProductOptionService],
})
export class ProductOptionModule {}

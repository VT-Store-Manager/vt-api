import { MongoSessionService } from '@/providers/mongo/session.service'
import { Store, StoreSchema } from '@/schemas/store.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { CounterModule } from '../counter/counter.module'
import { FileService } from '../file/file.service'
import { ProductCategoryModule } from '../product-category/product-category.module'
import { ProductOptionModule } from '../product-option/product-option.module'
import { ProductModule } from '../product/product.module'
import { StoreController } from './store.controller'
import { StoreService } from './store.service'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Store.name, schema: StoreSchema }]),
		CounterModule,
		ProductModule,
		ProductCategoryModule,
		ProductOptionModule,
	],
	controllers: [StoreController],
	providers: [StoreService, FileService, MongoSessionService],
})
export class StoreModule {}

import { MongoSessionService } from '@/providers/mongo/session.service'
import { Store, StoreSchema } from '@/schemas/store.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { CounterModule } from '../counter/counter.module'
import { FileService } from '../file/file.service'
import { ProductCategoryModule } from '../product-category/product-category.module'
import { ProductOptionModule } from '../product-option/product-option.module'
import { ProductModule } from '../product/product.module'
import { StoreAdminController } from './admin-app/store_admin.controller'
import { StoreAdminService } from './admin-app/store_admin.service'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Store.name, schema: StoreSchema }]),
		CounterModule,
		ProductModule,
		ProductCategoryModule,
		ProductOptionModule,
	],
	controllers: [StoreAdminController],
	providers: [StoreAdminService, FileService, MongoSessionService],
})
export class StoreModule {}

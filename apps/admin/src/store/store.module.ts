import { CounterModule, FileService, SettingModule } from '@app/common'
import {
	MemberData,
	MemberDataSchema,
	MongoSessionService,
	Store,
	StoreSchema,
} from '@app/database'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { ProductCategoryModule } from '../product-category/product-category.module'
import { ProductOptionModule } from '../product-option/product-option.module'
import { ProductModule } from '../product/product.module'
import { StoreController } from './store.controller'
import { StoreService } from './store.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Store.name, schema: StoreSchema },
			{ name: MemberData.name, schema: MemberDataSchema },
		]),
		CounterModule,
		ProductModule,
		ProductCategoryModule,
		ProductOptionModule,
		SettingModule,
	],
	controllers: [StoreController],
	providers: [StoreService, FileService, MongoSessionService],
})
export class StoreModule {}

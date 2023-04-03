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
import { StoreMemberController } from './member-app/store_member.controller'
import { StoreMemberService } from './member-app/store_member.service'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Store.name, schema: StoreSchema }]),
		CounterModule,
		ProductModule,
		ProductCategoryModule,
		ProductOptionModule,
	],
	controllers: [StoreAdminController, StoreMemberController],
	providers: [
		StoreAdminService,
		StoreMemberService,
		FileService,
		MongoSessionService,
	],
})
export class StoreModule {}

import { MongoSessionService } from '@/common/providers/mongo-session.service'
import { MemberData, MemberDataSchema } from '@schema/member-data.schema'
import { Store, StoreSchema } from '@schema/store.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { CounterModule } from '../counter/counter.module'
import { FileService } from '../file/file.service'
import { SettingModule } from '../setting/setting.module'
import { StoreAdminController } from './admin-app/store_admin.controller'
import { StoreAdminService } from './admin-app/store_admin.service'
import { StoreMemberController } from './member-app/store_member.controller'
import { StoreMemberService } from './member-app/store_member.service'
import { ProductModule } from '@/app/admin/product/product.module'
import { ProductCategoryModule } from '@/app/admin/product-category/product-category.module'
import { ProductOptionModule } from '@/app/admin/product-option/product-option.module'

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
	controllers: [StoreAdminController, StoreMemberController],
	providers: [
		StoreAdminService,
		StoreMemberService,
		FileService,
		MongoSessionService,
	],
})
export class StoreModule {}

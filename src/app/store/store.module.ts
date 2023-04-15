import { SettingType } from '@/common/constants'
import { MongoSessionService } from '@/providers/mongo/session.service'
import { MemberData, MemberDataSchema } from '@/schemas/member-data.schema'
import { SettingGeneralSchema } from '@/schemas/setting-general.schema'
import { SettingMemberAppSchema } from '@/schemas/setting-member-app.schema'
import { Setting, SettingSchema } from '@/schemas/setting.schema'
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
		MongooseModule.forFeature([
			{ name: Store.name, schema: StoreSchema },
			{ name: MemberData.name, schema: MemberDataSchema },
			{
				name: Setting.name,
				schema: SettingSchema,
				discriminators: [
					{
						name: SettingType.GENERAL,
						schema: SettingGeneralSchema,
					},
					{
						name: SettingType.MEMBER_APP,
						schema: SettingMemberAppSchema,
					},
				],
			},
		]),
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

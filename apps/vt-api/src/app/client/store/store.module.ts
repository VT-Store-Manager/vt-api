import { SettingModule } from '@/app/modules/setting/setting.module'
import { MongoSessionService } from '@/common/providers/mongo-session.service'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { MemberData, MemberDataSchema } from '@schema/member-data.schema'
import { Store, StoreSchema } from '@schema/store.schema'

import { StoreController } from './store.controller'
import { StoreService } from './store.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Store.name, schema: StoreSchema },
			{ name: MemberData.name, schema: MemberDataSchema },
		]),
		SettingModule,
	],
	controllers: [StoreController],
	providers: [StoreService, MongoSessionService],
})
export class StoreModule {}

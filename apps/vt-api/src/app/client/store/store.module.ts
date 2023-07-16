import { SettingModule } from '@/app/modules/setting/setting.module'
import { MongoSessionService } from '@app/common'
import { MemberData, MemberDataSchema, Store, StoreSchema } from '@app/database'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

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

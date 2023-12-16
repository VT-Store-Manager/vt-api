import { SettingType } from '@app/common'
import {
	SettingGeneralSchema,
	Setting,
	SettingSchema,
	SettingMemberAppSchema,
	SettingSaleAppSchema,
} from '@app/database'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { SettingGeneralService } from './services/setting-general.service'
import { SettingMemberAppService } from './services/setting-member-app.service'
import { SettingSaleService } from './services/setting-sale.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Setting.name,
				schema: SettingSchema,
				discriminators: [
					{ name: SettingType.GENERAL, schema: SettingGeneralSchema },
					{ name: SettingType.MEMBER_APP, schema: SettingMemberAppSchema },
					{ name: SettingType.SALE_APP, schema: SettingSaleAppSchema },
				],
			},
		]),
	],
	providers: [
		SettingGeneralService,
		SettingMemberAppService,
		SettingSaleService,
	],
	exports: [SettingGeneralService, SettingMemberAppService, SettingSaleService],
})
export class SettingModule {}

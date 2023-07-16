import { SettingType } from '@/common/constants'
import { SettingGeneralSchema } from '@schema/setting-general.schema'
import { SettingMemberAppSchema } from '@schema/setting-member-app.schema'
import { Setting, SettingSchema } from '@schema/setting.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { SettingGeneralService } from './services/setting-general.service'
import { SettingMemberAppService } from './services/setting-member-app.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Setting.name,
				schema: SettingSchema,
				discriminators: [
					{ name: SettingType.GENERAL, schema: SettingGeneralSchema },
					{ name: SettingType.MEMBER_APP, schema: SettingMemberAppSchema },
				],
			},
		]),
	],
	controllers: [],
	providers: [SettingGeneralService, SettingMemberAppService],
	exports: [SettingGeneralService, SettingMemberAppService],
})
export class SettingModule {}

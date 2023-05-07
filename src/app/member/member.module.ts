import { MongoSessionService } from '@/providers/mongo/session.service'
import { MemberData, MemberDataSchema } from '@/schemas/member-data.schema'
import { Member, MemberSchema } from '@/schemas/member.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { SettingModule } from '../setting/setting.module'
import { MemberSettingController } from './member-app/member-setting_member.controller'
import { MemberSettingService } from './member-app/member-setting_member.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Member.name, schema: MemberSchema },
			{ name: MemberData.name, schema: MemberDataSchema },
		]),
		SettingModule,
	],
	controllers: [MemberSettingController],
	providers: [MemberSettingService, MongoSessionService],
})
export class MemberModule {}

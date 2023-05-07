import { MemberData, MemberDataSchema } from '@/schemas/member-data.schema'
import { Member, MemberSchema } from '@/schemas/member.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { MemberSettingController } from './member-app/member-setting_member.controller'
import { MemberSettingService } from './member-app/member-setting_member.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Member.name, schema: MemberSchema },
			{ name: MemberData.name, schema: MemberDataSchema },
		]),
	],
	controllers: [MemberSettingController],
	providers: [MemberSettingService],
})
export class MemberModule {}

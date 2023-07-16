import { SettingModule } from '@/app/modules/setting/setting.module'
import { MongoSessionService } from '@app/common'
import {
	CartTemplate,
	CartTemplateSchema,
	Member,
	MemberData,
	MemberDataSchema,
	MemberSchema,
	MemberVoucher,
	MemberVoucherSchema,
} from '@app/database'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { MemberAppController } from './controllers/member-app.controller'
import { MemberSettingController } from './controllers/member-setting.controller'
import { MemberService } from './member.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Member.name, schema: MemberSchema },
			{ name: MemberData.name, schema: MemberDataSchema },
			{ name: MemberVoucher.name, schema: MemberVoucherSchema },
			{ name: CartTemplate.name, schema: CartTemplateSchema },
		]),
		SettingModule,
	],
	controllers: [MemberSettingController, MemberAppController],
	providers: [MemberService, MongoSessionService],
})
export class MemberModule {}

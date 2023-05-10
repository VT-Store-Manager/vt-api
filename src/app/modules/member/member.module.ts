import { MongoSessionService } from '@/common/providers/mongo-session.service'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { CartTemplate, CartTemplateSchema } from '@schema/cart-template.schema'
import { MemberData, MemberDataSchema } from '@schema/member-data.schema'
import {
	MemberVoucher,
	MemberVoucherSchema,
} from '@schema/member-voucher.schema'
import { Member, MemberSchema } from '@schema/member.schema'

import { SettingModule } from '../setting/setting.module'
import { MemberAppController } from './member-app/controllers/member-app_member.controller'
import { MemberSettingController } from './member-app/controllers/member-setting_member.controller'
import { MemberService } from './member-app/member_member.service'

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

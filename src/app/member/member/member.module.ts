import { SettingModule } from '@/app/modules/setting/setting.module'
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

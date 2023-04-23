import { MemberRank, MemberRankSchema } from '@/schemas/member-rank.schema'
import {
	MemberVoucher,
	MemberVoucherSchema,
} from '@/schemas/member-voucher.schema'
import { Voucher, VoucherSchema } from '@/schemas/voucher.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { MemberVoucherAdminController } from './admin-app/member-voucher_admin.controller'
import { MemberVoucherAdminService } from './admin-app/member-voucher_admin.service'
import { MemberVoucherMemberController } from './member-app/member-voucher_member.controller'
import { MemberVoucherMemberService } from './member-app/member-voucher_member.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Voucher.name, schema: VoucherSchema },
			{ name: MemberVoucher.name, schema: MemberVoucherSchema },
			{ name: MemberRank.name, schema: MemberRankSchema },
		]),
	],
	controllers: [MemberVoucherAdminController, MemberVoucherMemberController],
	providers: [MemberVoucherAdminService, MemberVoucherMemberService],
})
export class MemberVoucherModule {}
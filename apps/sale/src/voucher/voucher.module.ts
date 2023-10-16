import {
	FileService,
	SettingGeneralService,
	SettingMemberAppService,
	SettingModule,
} from '@app/common'
import {
	MemberRank,
	MemberRankSchema,
	MemberVoucher,
	MemberVoucherSchema,
	MongoSessionService,
	Product,
	ProductOption,
	ProductOptionSchema,
	ProductSchema,
	Voucher,
	VoucherSchema,
} from '@app/database'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { VoucherController } from './voucher.controller'
import { VoucherService } from './voucher.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Voucher.name, schema: VoucherSchema },
			{
				name: Product.name,
				schema: ProductSchema,
			},
			{
				name: ProductOption.name,
				schema: ProductOptionSchema,
			},
			{
				name: MemberRank.name,
				schema: MemberRankSchema,
			},
			{
				name: MemberVoucher.name,
				schema: MemberVoucherSchema,
			},
		]),
		SettingModule,
	],
	controllers: [VoucherController],
	providers: [VoucherService, FileService, MongoSessionService],
	exports: [VoucherService],
})
export class VoucherModule {}

import { FileService } from '@/app/modules/file/file.service'
import { MongoSessionService } from '@app/common'
import {
	MemberRank,
	MemberRankSchema,
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
		]),
	],
	controllers: [VoucherController],
	providers: [VoucherService, FileService, MongoSessionService],
	exports: [VoucherService],
})
export class VoucherModule {}

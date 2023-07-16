import { FileService } from '@/app/modules/file/file.service'
import { MongoSessionService } from '@/common/providers/mongo-session.service'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { MemberRank, MemberRankSchema } from '@schema/member-rank.schema'
import {
	ProductOption,
	ProductOptionSchema,
} from '@schema/product-option.schema'
import { Product, ProductSchema } from '@schema/product.schema'
import { Voucher, VoucherSchema } from '@schema/voucher.schema'

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

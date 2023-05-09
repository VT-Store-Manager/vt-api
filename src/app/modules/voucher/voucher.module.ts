import { MongoSessionService } from '@/common/providers/mongo-session.service'
import { MemberRank, MemberRankSchema } from '@schema/member-rank.schema'
import {
	ProductOption,
	ProductOptionSchema,
} from '@schema/product-option.schema'
import { Product, ProductSchema } from '@schema/product.schema'
import { Voucher, VoucherSchema } from '@schema/voucher.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { FileService } from '../file/file.service'
import { VoucherAdminController } from './admin-app/voucher_admin.controller'
import { VoucherAdminService } from './admin-app/voucher_admin.service'
import { VoucherMemberController } from './member-app/voucher_member.controller'
import { VoucherMemberService } from './member-app/voucher_member.service'

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
	controllers: [VoucherAdminController, VoucherMemberController],
	providers: [
		VoucherAdminService,
		VoucherMemberService,
		FileService,
		MongoSessionService,
	],
	exports: [VoucherMemberService],
})
export class VoucherModule {}

import {
	MemberVoucher,
	MemberVoucherSchema,
} from '@/schemas/member-voucher.schema'
import {
	ProductOption,
	ProductOptionSchema,
} from '@/schemas/product-option.schema'
import { Product, ProductSchema } from '@/schemas/product.schema'
import { Voucher, VoucherSchema } from '@/schemas/voucher.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { VoucherModule } from '../voucher/voucher.module'

import { OrderMemberController } from './member-app/order_member.controller'
import { OrderMemberService } from './member-app/order_member.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: MemberVoucher.name, schema: MemberVoucherSchema },
			{ name: Voucher.name, schema: VoucherSchema },
			{ name: Product.name, schema: ProductSchema },
			{ name: ProductOption.name, schema: ProductOptionSchema },
		]),
		VoucherModule,
	],
	controllers: [OrderMemberController],
	providers: [OrderMemberService],
})
export class OrderModule {}

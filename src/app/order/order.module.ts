import { OrderBuyer } from '@/common/constants'
import { MemberData, MemberDataSchema } from '@/schemas/member-data.schema'
import { MemberRank, MemberRankSchema } from '@/schemas/member-rank.schema'
import {
	MemberVoucher,
	MemberVoucherSchema,
} from '@/schemas/member-voucher.schema'
import { OrderCustomerSchema } from '@/schemas/order-customer.schema'
import { OrderMemberSchema } from '@/schemas/order-member.schema'
import { Order, OrderSchema } from '@/schemas/order.schema'
import {
	ProductOption,
	ProductOptionSchema,
} from '@/schemas/product-option.schema'
import { Product, ProductSchema } from '@/schemas/product.schema'
import { Store, StoreSchema } from '@/schemas/store.schema'
import { Voucher, VoucherSchema } from '@/schemas/voucher.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { SettingModule } from '../setting/setting.module'
import { VoucherModule } from '../voucher/voucher.module'
import { OrderMemberController } from './member-app/order_member.controller'
import { OrderMemberService } from './member-app/order_member.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Order.name,
				schema: OrderSchema,
				discriminators: [
					{ name: OrderBuyer.CUSTOMER, schema: OrderCustomerSchema },
					{ name: OrderBuyer.MEMBER, schema: OrderMemberSchema },
				],
			},
			{ name: MemberVoucher.name, schema: MemberVoucherSchema },
			{ name: MemberRank.name, schema: MemberRankSchema },
			{ name: MemberData.name, schema: MemberDataSchema },
			{ name: Voucher.name, schema: VoucherSchema },
			{ name: Product.name, schema: ProductSchema },
			{ name: Store.name, schema: StoreSchema },
			{ name: ProductOption.name, schema: ProductOptionSchema },
		]),
		VoucherModule,
		SettingModule,
	],
	controllers: [OrderMemberController],
	providers: [OrderMemberService],
})
export class OrderModule {}

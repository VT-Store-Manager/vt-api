import { SettingModule } from '@/app/modules/setting/setting.module'
import { VoucherModule } from '@/app/client/voucher/voucher.module'
import { OrderBuyer } from '@/common/constants'
import { MongoSessionService } from '@/common/providers/mongo-session.service'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { MemberData, MemberDataSchema } from '@schema/member-data.schema'
import { MemberRank, MemberRankSchema } from '@schema/member-rank.schema'
import {
	MemberVoucherHistory,
	MemberVoucherHistorySchema,
} from '@schema/member-voucher-history.schema'
import {
	MemberVoucher,
	MemberVoucherSchema,
} from '@schema/member-voucher.schema'
import { OrderCustomerSchema } from '@schema/order-customer.schema'
import { OrderMemberSchema } from '@schema/order-member.schema'
import { Order, OrderSchema } from '@schema/order.schema'
import {
	ProductOption,
	ProductOptionSchema,
} from '@schema/product-option.schema'
import { Product, ProductSchema } from '@schema/product.schema'
import { Store, StoreSchema } from '@schema/store.schema'
import { Voucher, VoucherSchema } from '@schema/voucher.schema'

import { OrderStateController } from './controllers/order-state.controller'
import { OrderController } from './controllers/order.controller'
import { OrderStateService } from './services/order-state.service'
import { OrderService } from './services/order.service'

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
			{ name: MemberVoucherHistory.name, schema: MemberVoucherHistorySchema },
		]),
		VoucherModule,
		SettingModule,
	],
	controllers: [OrderController, OrderStateController],
	providers: [OrderService, OrderStateService, MongoSessionService],
})
export class OrderModule {}

import { OrderBuyer } from '@/common/constants'
import {
	MemberData,
	MemberDataSchema,
} from '@/database/schemas/member-data.schema'
import {
	MemberRank,
	MemberRankSchema,
} from '@/database/schemas/member-rank.schema'
import {
	MemberVoucherHistory,
	MemberVoucherHistorySchema,
} from '@/database/schemas/member-voucher-history.schema'
import {
	MemberVoucher,
	MemberVoucherSchema,
} from '@/database/schemas/member-voucher.schema'
import { OrderCustomerSchema } from '@/database/schemas/order-customer.schema'
import { OrderMemberSchema } from '@/database/schemas/order-member.schema'
import { Order, OrderSchema } from '@/database/schemas/order.schema'
import {
	ProductOption,
	ProductOptionSchema,
} from '@/database/schemas/product-option.schema'
import { Product, ProductSchema } from '@/database/schemas/product.schema'
import { Store, StoreSchema } from '@/database/schemas/store.schema'
import { Voucher, VoucherSchema } from '@/database/schemas/voucher.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { OrderStateController } from './controllers/order-state.controller'
import { OrderController } from './controllers/order.controller'
import { OrderStateService } from './services/order-state.service'
import { OrderService } from './services/order.service'
import { VoucherModule } from '../voucher/voucher.module'
import { SettingModule } from '@/app/modules/setting/setting.module'
import { MongoSessionService } from '@/common/providers/mongo-session.service'

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
	controllers: [OrderStateController, OrderController],
	providers: [OrderStateService, OrderService, MongoSessionService],
})
export class OrderModule {}

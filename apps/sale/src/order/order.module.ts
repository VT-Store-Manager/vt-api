import { MomoModule, OrderBuyer, SettingModule } from '@app/common'
import {
	Employee,
	EmployeeSchema,
	MemberData,
	MemberDataSchema,
	MemberRank,
	MemberRankSchema,
	MemberVoucher,
	MemberVoucherHistory,
	MemberVoucherHistorySchema,
	MemberVoucherSchema,
	MongoSessionService,
	Order,
	OrderCustomerSchema,
	OrderMemberSchema,
	OrderSchema,
	Product,
	ProductOption,
	ProductOptionSchema,
	ProductSchema,
	Store,
	StoreSchema,
	Voucher,
	VoucherSchema,
} from '@app/database'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { VoucherModule } from '../voucher/voucher.module'
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
			{ name: Employee.name, schema: EmployeeSchema },
		]),
		VoucherModule,
		SettingModule,
		MomoModule,
	],
	controllers: [OrderStateController, OrderController],
	providers: [OrderStateService, OrderService, MongoSessionService],
	exports: [OrderService, MongooseModule],
})
export class OrderModule {}

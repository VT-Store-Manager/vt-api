import { OrderBuyer } from '@app/common'
import {
	Member,
	MemberSchema,
	MomoPayment,
	MomoPaymentSchema,
	Order,
	OrderCustomerSchema,
	OrderMemberSchema,
	OrderSchema,
} from '@app/database'
import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { MomoService } from './momo.service'

@Module({
	imports: [
		HttpModule,
		MongooseModule.forFeature([
			{
				name: Order.name,
				schema: OrderSchema,
				discriminators: [
					{ name: OrderBuyer.CUSTOMER, schema: OrderCustomerSchema },
					{ name: OrderBuyer.MEMBER, schema: OrderMemberSchema },
				],
			},
			{
				name: Member.name,
				schema: MemberSchema,
			},
			{
				name: MomoPayment.name,
				schema: MomoPaymentSchema,
			},
		]),
	],
	providers: [MomoService],
	exports: [MomoService],
})
export class MomoModule {}

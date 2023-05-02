import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { OmitType } from '@nestjs/swagger'

import {
	OrderInfoMember,
	OrderInfoMemberSchema,
} from './order-info-member.schema'
import {
	OrderInfoReview,
	OrderInfoReviewSchema,
} from './order-info-review.schema'
import {
	OrderInfoVoucher,
	OrderInfoVoucherSchema,
} from './order-info-voucher.schema'
import { Order } from './order.schema'

export type OrderMemberDocument = OrderMember & Document

@Schema({ versionKey: false })
export class OrderMember extends OmitType(Order, ['buyer'] as const) {
	buyer: string

	@Prop({ type: OrderInfoMemberSchema, required: true })
	member: OrderInfoMember

	@Prop({ type: OrderInfoVoucherSchema })
	voucher?: OrderInfoVoucher

	@Prop({ type: Number, required: true, min: 0 })
	point: number

	@Prop({ type: OrderInfoReviewSchema })
	review?: OrderInfoReview
}

export const OrderMemberSchema = SchemaFactory.createForClass(OrderMember)

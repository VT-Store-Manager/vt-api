import { Types } from 'mongoose'

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema({ versionKey: false, _id: false })
export class OrderInfoVoucher {
	@Prop({ type: Types.ObjectId, ref: 'Voucher', required: true })
	id: Types.ObjectId

	@Prop({ type: String, required: true, minlength: 1 })
	title: string

	@Prop({ type: String, required: true, minlength: 1 })
	code: string

	@Prop({ type: Number, required: true, min: 0 })
	discountPrice: number
}

export const OrderInfoVoucherSchema =
	SchemaFactory.createForClass(OrderInfoVoucher)

import { PaymentStatus } from '@app/common'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'

export type MomoPaymentDocument = Document & MomoPayment

@Schema({
	versionKey: false,
	timestamps: true,
	suppressReservedKeysWarning: true,
	collection: 'momo_payments',
})
export class MomoPayment {
	_id?: Types.ObjectId

	@Prop({
		type: Types.ObjectId,
		ref: 'Order',
		set: (v: string) => new Types.ObjectId(v.toString()),
		required: true,
	})
	cartOrderId: Types.ObjectId

	@Prop({ type: String, required: true })
	requestId: string

	@Prop({ type: String, required: true })
	orderId: string

	@Prop({ type: Number })
	transId?: number

	@Prop({ type: Number })
	resultCode?: number

	@Prop({ type: String })
	message?: string

	@Prop({
		type: String,
		enum: Object.values(PaymentStatus),
		default: PaymentStatus.PENDING,
	})
	status?: PaymentStatus

	createdAt?: Date
	updatedAt?: Date
}

export const MomoPaymentSchema = SchemaFactory.createForClass(MomoPayment)

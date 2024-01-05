import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema({ versionKey: false, _id: false })
export class MomoPaymentRefund {
	@Prop({ type: String })
	orderId?: string

	@Prop({ type: String })
	requestId?: string

	@Prop({ type: Number, min: 0 })
	amount?: number

	@Prop({ type: Number, min: 0 })
	transId?: number

	@Prop({ type: Number, min: 0 })
	resultCode: number

	@Prop({ type: String })
	message: string

	@Prop({ type: Number, min: 0 })
	responseTime: number
}

export const MomoPaymentRefundSchema =
	SchemaFactory.createForClass(MomoPaymentRefund)

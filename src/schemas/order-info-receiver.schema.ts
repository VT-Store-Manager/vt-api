import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema({ versionKey: false, _id: false })
export class OrderInfoReceiver {
	@Prop({ type: String, required: true })
	name: string

	@Prop({ type: String, required: true })
	phone: string

	@Prop({ type: String, required: true })
	address: string

	@Prop({ type: Date })
	timer?: Date
}

export const OrderInfoReceiverSchema =
	SchemaFactory.createForClass(OrderInfoReceiver)

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'

@Schema({ versionKey: false, _id: false })
export class OrderInfoEmployee {
	@Prop({ type: Types.ObjectId, ref: 'Employee' })
	id: Types.ObjectId

	@Prop({ type: String, required: true })
	phone: string

	@Prop({ type: String, required: true })
	name: string

	@Prop({ type: String, required: true, default: '' })
	avatar: string
}

export const OrderInfoEmployeeSchema =
	SchemaFactory.createForClass(OrderInfoEmployee)

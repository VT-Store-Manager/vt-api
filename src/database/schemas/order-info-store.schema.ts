import { Types } from 'mongoose'

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema({ versionKey: false, _id: false })
export class OrderInfoStore {
	@Prop({ type: Types.ObjectId, required: true })
	id: Types.ObjectId | string

	@Prop({ type: String, required: true, minlength: 1 })
	name: string

	@Prop({ type: String, required: true, minlength: 1 })
	address: string
}

export const OrderInfoStoreSchema = SchemaFactory.createForClass(OrderInfoStore)
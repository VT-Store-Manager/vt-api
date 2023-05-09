import Joi from '@/common/validations/joi.validator'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema({ versionKey: false, _id: false })
export class OrderInfoReceiver {
	@Prop({ type: String, required: true })
	name: string

	@Prop({
		type: String,
		required: true,
		validate: (v: string) => {
			const error = Joi.string().phoneNumber({ strict: true }).validate(v).error
			if (error)
				throw new Error(
					error.message ||
						error.details.map(detail => detail.message).join(', ')
				)
			return true
		},
	})
	phone: string

	@Prop({ type: String, required: true })
	address: string

	@Prop({ type: Date })
	timer?: Date
}

export const OrderInfoReceiverSchema =
	SchemaFactory.createForClass(OrderInfoReceiver)

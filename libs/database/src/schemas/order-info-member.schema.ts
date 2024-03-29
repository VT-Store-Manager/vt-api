import { Types } from 'mongoose'

import { Joi, validateVnPhoneNumber } from '@app/common'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema({ versionKey: false, _id: false })
export class OrderInfoMember {
	@Prop({ type: Types.ObjectId, ref: 'Member', required: true })
	id: Types.ObjectId | string

	@Prop({ type: String, required: true, min: 1 })
	name: string

	@Prop({
		type: String,
		validate: (v: string) => {
			const { error } = Joi.string().email().validate(v)
			if (error)
				throw new Error(
					error.message ||
						error.details.map(detail => detail.message).join(', ')
				)
			return true
		},
	})
	email?: string

	@Prop({
		type: String,
		validate: validateVnPhoneNumber,
		required: true,
	})
	phone: string

	@Prop({
		type: String,
		required: true,
		minlength: 1,
	})
	rankName: string

	@Prop({
		type: String,
		required: true,
		minlength: 1,
	})
	rankColor: string
}

export const OrderInfoMemberSchema =
	SchemaFactory.createForClass(OrderInfoMember)

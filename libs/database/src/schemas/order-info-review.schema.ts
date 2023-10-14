import { Types } from 'mongoose'

import { StoreCriterion } from '@app/common'
import { Joi } from '@app/common'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema({ versionKey: false })
export class OrderInfoReview {
	@Prop({ type: Types.ObjectId })
	_id?: Types.ObjectId

	@Prop({
		type: Number,
		required: true,
		min: 1,
		max: 5,
		set: (v: number) => +(v * 2).toFixed(0) / 2,
	})
	rate: number

	@Prop({ type: String, default: '' })
	content: string

	@Prop({
		type: [Number],
		validate: (v: number[]) => {
			if (!v || !Array.isArray(v)) throw new Error('satisfied must be an array')
			const validateResult = v.every(
				_v =>
					!Joi.number()
						.valid(...Object.values(StoreCriterion))
						.validate(_v).error
			)
			if (!validateResult) throw new Error('satisfied values must be [0,1,2,3]')
			return true
		},
		default: [],
	})
	satisfied?: StoreCriterion[]

	@Prop({ type: [Types.ObjectId], default: [] })
	likeItems?: Array<Types.ObjectId | string>

	@Prop({ type: [Types.ObjectId], default: [] })
	dislikeItems?: Array<Types.ObjectId | string>
}

export const OrderInfoReviewSchema =
	SchemaFactory.createForClass(OrderInfoReview)

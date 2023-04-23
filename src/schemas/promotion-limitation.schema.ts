import { Types } from 'mongoose'

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema({ versionKey: false, _id: false })
export class PromotionLimitation {
	@Prop({
		type: [Types.ObjectId],
		ref: 'MemberRank',
		default: () => [],
		required: true,
	})
	target: Array<string | Types.ObjectId>

	@Prop({ type: Number, min: 0 })
	maxExchange?: number
}

export const PromotionLimitationSchema =
	SchemaFactory.createForClass(PromotionLimitation)

import { Document, Types } from 'mongoose'

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

import { ShortPromotion, ShortPromotionSchema } from './promotion.schema'

export type MemberPromotionHistoryDocument = Document & MemberPromotionHistory

@Schema({
	versionKey: false,
	timestamps: { createdAt: true },
	suppressReservedKeysWarning: true,
	collection: 'member_promotion_histories',
})
export class MemberPromotionHistory {
	_id?: Types.ObjectId

	@Prop({ type: Types.ObjectId, required: true })
	member: Types.ObjectId | string

	@Prop({ type: Types.ObjectId, required: true })
	promotion: Types.ObjectId | string

	@Prop({ type: ShortPromotionSchema, required: true })
	promotionData: ShortPromotion

	createdAt?: Date
}

export const MemberPromotionHistorySchema = SchemaFactory.createForClass(
	MemberPromotionHistory
)

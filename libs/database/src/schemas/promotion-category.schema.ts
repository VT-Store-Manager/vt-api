import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type PromotionCategoryDocument = PromotionCategory & Document

@Schema({
	versionKey: false,
	timestamps: true,
	suppressReservedKeysWarning: true,
	collection: 'promotion_categories',
})
export class PromotionCategory {
	_id?: Types.ObjectId

	@Prop({ type: String, required: true })
	name: string

	@Prop({ type: String, required: true })
	image: string

	createdAt?: Date
	updatedAt?: Date
}

export const PromotionCategorySchema =
	SchemaFactory.createForClass(PromotionCategory)

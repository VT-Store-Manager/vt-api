import { Document, Types } from 'mongoose'

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

export type PartnerDocument = Partner & Document

@Schema({ versionKey: false, timestamps: true })
export class Partner {
	_id?: Types.ObjectId

	@Prop({ type: String, required: true, unique: true })
	code: string

	@Prop({ type: String, required: true })
	name: string

	@Prop({ type: String, required: true })
	image: string

	createdAt?: Date
	updatedAt?: Date
}

export const PartnerSchema = SchemaFactory.createForClass(Partner)

@Schema({ versionKey: false, _id: false })
export class ShortPartner {
	@Prop({ type: Types.ObjectId, ref: 'Partner' })
	id?: Types.ObjectId

	@Prop({ type: String, required: true })
	name: string

	@Prop({ type: String, required: true })
	image: string
}

export const ShortPartnerSchema = SchemaFactory.createForClass(ShortPartner)

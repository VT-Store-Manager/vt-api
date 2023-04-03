import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types, Document } from 'mongoose'

export type BrandDocument = Brand & Document

@Schema({ versionKey: false, timestamps: true })
export class Brand {
	_id?: Types.ObjectId

	@Prop({ type: String, required: true })
	name: string

	@Prop({ type: String, required: true })
	image: string

	createdAt?: Date
	updatedAt?: Date
}

export const BrandSchema = SchemaFactory.createForClass(Brand)

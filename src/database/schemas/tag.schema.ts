import { Document, Types } from 'mongoose'

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

export type TagDocument = Tag & Document

@Schema({ versionKey: true, timestamps: { updatedAt: true, createdAt: false } })
export class Tag {
	_id?: Types.ObjectId

	@Prop({ type: String, required: true, minlength: 1, unique: true })
	name: string

	updatedAt?: Date
}

export const TagSchema = SchemaFactory.createForClass(Tag)

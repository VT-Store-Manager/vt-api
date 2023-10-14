import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'

export type SlideDocument = Slide & Document

@Schema({ timestamps: true, versionKey: false })
export class Slide {
	_id?: Types.ObjectId

	@Prop({ type: String, required: true })
	image: string

	@Prop({ type: String, default: null })
	url?: string

	createdAt?: Date
	updatedAt?: Date
}

export const SlideSchema = SchemaFactory.createForClass(Slide)
